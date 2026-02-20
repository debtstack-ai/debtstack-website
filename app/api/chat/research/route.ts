// app/api/chat/research/route.ts
// On-demand SEC EDGAR research: fetch 10-K, extract debt instruments via Gemini

import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 120;

const SEC_USER_AGENT = "DebtStack.ai contact@debtstack.ai";

// In-memory cache for SEC company tickers (ticker → CIK mapping)
let tickerCache: Map<string, string> | null = null;
let tickerCacheTime = 0;
const TICKER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Step 1: Ticker → CIK resolution
// ---------------------------------------------------------------------------

async function getTickerToCIKMap(): Promise<Map<string, string>> {
  if (tickerCache && Date.now() - tickerCacheTime < TICKER_CACHE_TTL) {
    return tickerCache;
  }

  const resp = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": SEC_USER_AGENT },
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch SEC company tickers: ${resp.status}`);
  }

  const data = (await resp.json()) as Record<
    string,
    { cik_str: number; ticker: string; title: string }
  >;

  const map = new Map<string, string>();
  for (const entry of Object.values(data)) {
    map.set(entry.ticker.toUpperCase(), String(entry.cik_str));
  }

  tickerCache = map;
  tickerCacheTime = Date.now();
  return map;
}

async function resolveCIK(ticker: string): Promise<string | null> {
  const map = await getTickerToCIKMap();
  return map.get(ticker.toUpperCase()) ?? null;
}

// ---------------------------------------------------------------------------
// Step 2: Find latest 10-K (or 20-F) filing
// ---------------------------------------------------------------------------

interface FilingInfo {
  accessionNumber: string;
  primaryDocument: string;
  filingDate: string;
  form: string;
}

async function findLatest10K(cik: string): Promise<FilingInfo | null> {
  const paddedCIK = cik.padStart(10, "0");
  const url = `https://data.sec.gov/submissions/CIK${paddedCIK}.json`;

  const resp = await fetch(url, {
    headers: {
      "User-Agent": SEC_USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!resp.ok) {
    throw new Error(`SEC submissions API error: ${resp.status}`);
  }

  const data = await resp.json();
  const recent = data.filings?.recent;
  if (!recent) return null;

  const forms: string[] = recent.form ?? [];
  const accessions: string[] = recent.accessionNumber ?? [];
  const primaryDocs: string[] = recent.primaryDocument ?? [];
  const filingDates: string[] = recent.filingDate ?? [];

  // Find most recent 10-K or 20-F
  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    if (form === "10-K" || form === "10-K/A" || form === "20-F" || form === "20-F/A") {
      return {
        accessionNumber: accessions[i],
        primaryDocument: primaryDocs[i],
        filingDate: filingDates[i],
        form,
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Step 3: Download and clean filing HTML
// ---------------------------------------------------------------------------

function cleanFilingHtml(content: string): string {
  if (!content) return "";

  // Check if already clean text (no HTML tags in first 500 chars)
  const sample = content.slice(0, 500);
  if (!/<[a-zA-Z]/.test(sample)) return content;

  let text = content;

  // Remove XML declaration and DOCTYPE
  text = text.replace(/<\?xml[^>]*\?>/gi, "");
  text = text.replace(/<!DOCTYPE[^>]*>/gi, "");

  // Remove script and style blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove XBRL hidden sections
  text = text.replace(/<ix:hidden[\s\S]*?<\/ix:hidden>/gi, "");

  // Extract text from XBRL elements (keep their text content)
  text = text.replace(/<ix:[^>]*>([\s\S]*?)<\/ix:[^>]*>/gi, "$1");

  // Remove remaining HTML/XML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#x27;/gi, "'");
  text = text.replace(/&#x2019;/gi, "\u2019");
  text = text.replace(/&#x2014;/gi, "\u2014");
  text = text.replace(/&#x2013;/gi, "\u2013");
  text = text.replace(/&#\d+;/g, " ");
  text = text.replace(/&#x[0-9a-fA-F]+;/g, " ");

  // Normalize whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}

async function downloadFiling(
  cik: string,
  filing: FilingInfo
): Promise<string> {
  const accessionNoDashes = filing.accessionNumber.replace(/-/g, "");
  const url = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNoDashes}/${filing.primaryDocument}`;

  const resp = await fetch(url, {
    headers: { "User-Agent": SEC_USER_AGENT },
  });

  if (!resp.ok) {
    throw new Error(`Failed to download filing: ${resp.status}`);
  }

  const html = await resp.text();
  return cleanFilingHtml(html);
}

// ---------------------------------------------------------------------------
// Step 4: Extract debt footnote from cleaned text
// ---------------------------------------------------------------------------

// Priority patterns — debt footnote headers
const DEBT_HEADER_PRIORITY = [
  "debt - ",
  "long-term debt -",
  "long-term debt:",
  "debt and credit",
  "borrowings -",
  "borrowings:",
  "notes and debentures",
  "financing arrangements",
  "short-term borrowings and long-term debt",
  "deposits and borrowings",
  "credit facilities and debt",
  "long-term obligations",
  "indebtedness",
];

// General patterns — broader debt mentions
const DEBT_HEADER_GENERAL = [
  "long-term debt",
  "notes payable",
  "credit facility",
  "senior notes",
  "term loan",
  "revolving credit",
  "aggregate principal",
  "principal amount",
  "debt maturity",
  "secured credit",
];

function extractDebtFootnote(content: string, maxChars: number = 100_000): string {
  const lower = content.toLowerCase();
  let bestPos = -1;

  // Try priority patterns first
  for (const pattern of DEBT_HEADER_PRIORITY) {
    const pos = lower.indexOf(pattern);
    if (pos !== -1) {
      bestPos = pos;
      break;
    }
  }

  // Fall back to general patterns
  if (bestPos === -1) {
    for (const pattern of DEBT_HEADER_GENERAL) {
      const pos = lower.indexOf(pattern);
      if (pos !== -1) {
        bestPos = pos;
        break;
      }
    }
  }

  if (bestPos === -1) {
    // Last resort: return a chunk from the middle of the document
    const midStart = Math.max(0, Math.floor(content.length * 0.3));
    return content.slice(midStart, midStart + maxChars);
  }

  // Extract from a bit before the match to the max length
  const start = Math.max(0, bestPos - 500);
  return content.slice(start, start + maxChars);
}

// ---------------------------------------------------------------------------
// Step 5: Gemini extraction
// ---------------------------------------------------------------------------

const RESEARCH_EXTRACTION_PROMPT = `Extract ALL INDIVIDUAL DEBT INSTRUMENTS from this SEC 10-K filing debt section.

CRITICAL RULES:
- Extract EACH INDIVIDUAL instrument separately — NOT totals or aggregates.
- Amounts must be in CENTS (1 dollar = 100 cents, so $1 billion = 100,000,000,000 cents).
- Interest rates in BASIS POINTS (1% = 100 bps, so 5.25% = 525 bps).
- DETECT THE FILING'S SCALE from the document header (look for "in millions", "in thousands", "in billions", "$000") and convert amounts accordingly.

For each instrument extract:
- name: Specific name (e.g., "5.25% Senior Notes due 2030")
- instrument_type: One of: senior_notes, senior_secured_notes, subordinated_notes, convertible_notes, term_loan, revolver, abl, commercial_paper, debenture, mortgage, bond, other
- seniority: senior_secured, senior_unsecured, or subordinated
- rate_type: fixed or floating
- interest_rate: For fixed rate, in basis points (525 for 5.25%)
- spread_bps: For floating rate, spread over benchmark in bps
- benchmark: For floating rate (SOFR, Prime, etc.)
- outstanding_cents: Current outstanding amount in CENTS
- maturity_date: YYYY-MM-DD format
- cusip: 9-character CUSIP if disclosed, else null

Return JSON with this exact structure:
{
  "company_name": "Full legal company name",
  "ticker": "TICKER",
  "filing_date": "YYYY-MM-DD",
  "filing_scale": "millions|thousands|billions|units",
  "instruments": [
    {
      "name": "5.25% Senior Notes due 2030",
      "instrument_type": "senior_notes",
      "seniority": "senior_unsecured",
      "rate_type": "fixed",
      "interest_rate": 525,
      "spread_bps": null,
      "benchmark": null,
      "outstanding_cents": 150000000000,
      "maturity_date": "2030-06-15",
      "cusip": null
    }
  ],
  "total_debt_cents": 500000000000
}

IMPORTANT: Return ONLY the JSON object. No markdown, no code blocks, no explanatory text.

<filing_section>
{DEBT_SECTION}
</filing_section>`;

interface ResearchInstrument {
  name: string;
  instrument_type: string;
  seniority: string;
  rate_type: string;
  interest_rate: number | null;
  spread_bps: number | null;
  benchmark: string | null;
  outstanding_cents: number | null;
  maturity_date: string | null;
  cusip: string | null;
}

interface ResearchResult {
  company_name: string;
  ticker: string;
  cik: string;
  filing_date: string;
  filing_scale: string;
  instruments: ResearchInstrument[];
  total_debt_cents: number | null;
}

async function extractWithGemini(
  debtSection: string,
  ticker: string,
  cik: string,
  filingDate: string
): Promise<ResearchResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = RESEARCH_EXTRACTION_PROMPT.replace("{DEBT_SECTION}", debtSection);

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  }

  // Clean trailing commas before closing braces/brackets
  jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");

  const parsed = JSON.parse(jsonStr);

  return {
    company_name: parsed.company_name || ticker,
    ticker: parsed.ticker || ticker,
    cik,
    filing_date: parsed.filing_date || filingDate,
    filing_scale: parsed.filing_scale || "unknown",
    instruments: Array.isArray(parsed.instruments) ? parsed.instruments : [],
    total_debt_cents: parsed.total_debt_cents || null,
  };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: { ticker: string; company_name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { ticker } = body;
  if (!ticker || typeof ticker !== "string") {
    return Response.json({ error: "Ticker is required" }, { status: 400 });
  }

  const upperTicker = ticker.toUpperCase().trim();

  try {
    // Step 1: Resolve ticker to CIK
    const cik = await resolveCIK(upperTicker);
    if (!cik) {
      return Response.json(
        { error: `Could not find CIK for ticker "${upperTicker}". Verify the ticker is correct.` },
        { status: 404 }
      );
    }

    // Step 2: Find latest 10-K
    const filing = await findLatest10K(cik);
    if (!filing) {
      return Response.json(
        { error: `No 10-K or 20-F filing found for ${upperTicker} (CIK: ${cik}).` },
        { status: 404 }
      );
    }

    // Step 3: Download and clean
    const cleanedText = await downloadFiling(cik, filing);
    if (!cleanedText || cleanedText.length < 1000) {
      return Response.json(
        { error: `Filing content too short or empty for ${upperTicker}.` },
        { status: 422 }
      );
    }

    // Step 4: Extract debt footnote
    const debtSection = extractDebtFootnote(cleanedText);

    // Step 5: Gemini extraction
    const result = await extractWithGemini(
      debtSection,
      upperTicker,
      cik,
      filing.filingDate
    );

    return Response.json({
      data: result,
      meta: {
        source: "sec_edgar",
        filing_form: filing.form,
        filing_date: filing.filingDate,
        cik,
        note: "Live SEC filing research — not yet in DebtStack database",
      },
    });
  } catch (err) {
    console.error(`[research] Error researching ${upperTicker}:`, err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Research failed: ${message}` },
      { status: 500 }
    );
  }
}
