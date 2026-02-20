// lib/chat/tool-executor.ts
// Executes DebtStack API tool calls on behalf of the chat agent

const BACKEND_URL = process.env.BACKEND_URL || "https://api.debtstack.ai";

// Cost per endpoint (Pay-as-You-Go tier)
const ENDPOINT_COSTS: Record<string, number> = {
  search_companies: 0.05,
  search_bonds: 0.05,
  resolve_bond: 0.05,
  get_guarantors: 0.15,
  get_corporate_structure: 0.15,
  search_pricing: 0.05,
  search_documents: 0.15,
  get_changes: 0.1,
  web_search: 0.03,
  research_company: 0.0,
};

const MAX_RESULT_ITEMS = 20;
const TIMEOUT_MS = 15_000;
const RESEARCH_TIMEOUT_MS = 45_000;

export interface ToolResult {
  data: unknown;
  cost: number;
  error?: string;
}

// Slim down individual items to reduce token count for Gemini
function slimItem(item: unknown): unknown {
  if (!item || typeof item !== "object") return item;
  const obj = item as Record<string, unknown>;
  const slim: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip verbose fields that bloat the response
    if (key === "collateral" || key === "collateral_data_confidence" || key === "guarantee_data_confidence") continue;
    // Slim down pricing to just the key fields
    if (key === "pricing" && value && typeof value === "object") {
      const p = value as Record<string, unknown>;
      slim.pricing = {
        last_price: p.last_price,
        ytm: p.ytm,
        spread: p.spread,
        price_source: p.price_source,
      };
      continue;
    }
    slim[key] = value;
  }
  return slim;
}

function truncateResults(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in (data as Record<string, unknown>)) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      const total = obj.data.length;
      const slimmed = obj.data.slice(0, MAX_RESULT_ITEMS).map(slimItem);
      return {
        ...obj,
        data: slimmed,
        ...(total > MAX_RESULT_ITEMS ? { _truncated: { shown: MAX_RESULT_ITEMS, total } } : {}),
      };
    }
  }
  return data;
}

// Common ticker aliases — map alternate tickers to their DebtStack canonical form
const TICKER_ALIASES: Record<string, string> = {
  GOOG: "GOOGL",
  BRK: "BRK.B",
  "BRK.A": "BRK.B",
  FB: "META",
};

function normalizeTicker(ticker: string): string {
  const upper = ticker.toUpperCase().trim();
  // Handle comma-separated tickers
  if (upper.includes(",")) {
    return upper.split(",").map(t => TICKER_ALIASES[t.trim()] || t.trim()).join(",");
  }
  return TICKER_ALIASES[upper] || upper;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  apiKey: string
): Promise<ToolResult> {
  const cost = ENDPOINT_COSTS[toolName] ?? 0.05;
  const headers: Record<string, string> = {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };

  try {
    let response: Response;

    switch (toolName) {
      case "search_companies": {
        const params = new URLSearchParams();
        if (args.ticker) params.set("ticker", normalizeTicker(String(args.ticker)));
        if (args.sector) params.set("sector", String(args.sector));
        if (args.min_leverage) params.set("min_leverage", String(args.min_leverage));
        if (args.max_leverage) params.set("max_leverage", String(args.max_leverage));
        if (args.has_structural_sub !== undefined)
          params.set("has_structural_sub", String(args.has_structural_sub));
        // Skip args.fields — Gemini often guesses invalid field names causing 400s
        if (args.sort) params.set("sort", String(args.sort));
        params.set("limit", String(args.limit ?? 10));
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/companies?${params}`,
          { headers }
        );
        break;
      }

      case "search_bonds": {
        const params = new URLSearchParams();
        if (args.ticker) params.set("ticker", normalizeTicker(String(args.ticker)));
        if (args.seniority) params.set("seniority", String(args.seniority));
        if (args.min_ytm) params.set("min_ytm", String(args.min_ytm));
        if (args.has_pricing !== undefined)
          params.set("has_pricing", String(args.has_pricing));
        if (args.maturity_before)
          params.set("maturity_before", String(args.maturity_before));
        // Skip args.fields — Gemini often guesses invalid field names causing 400s
        params.set("limit", String(args.limit ?? 50));
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/bonds?${params}`,
          { headers }
        );
        break;
      }

      case "resolve_bond": {
        const query = String(args.query ?? "").trim();
        const params = new URLSearchParams();
        if (query.length === 9 && /^[A-Za-z0-9]+$/.test(query)) {
          params.set("cusip", query);
        } else if (query.length === 12 && /^[A-Z]{2}/.test(query)) {
          params.set("isin", query);
        } else {
          params.set("q", query);
          params.set("match_mode", "fuzzy");
        }
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/bonds/resolve?${params}`,
          { headers }
        );
        break;
      }

      case "get_guarantors": {
        const bondId = String(args.bond_id ?? "").trim();
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/entities/traverse`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              start: { type: "bond", id: bondId },
              relationships: ["guarantees"],
              direction: "inbound",
              fields: [
                "name",
                "entity_type",
                "jurisdiction",
                "is_guarantor",
              ],
            }),
          }
        );
        break;
      }

      case "get_corporate_structure": {
        const ticker = normalizeTicker(String(args.ticker ?? ""));
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/entities/traverse`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              start: { type: "company", id: ticker },
              relationships: ["subsidiaries"],
              direction: "outbound",
              depth: 10,
              fields: [
                "name",
                "entity_type",
                "jurisdiction",
                "is_guarantor",
                "is_vie",
                "debt_at_entity",
              ],
            }),
          }
        );
        break;
      }

      case "search_pricing": {
        const params = new URLSearchParams();
        if (args.ticker) params.set("ticker", normalizeTicker(String(args.ticker)));
        if (args.cusip) params.set("cusip", String(args.cusip));
        if (args.min_ytm) params.set("min_ytm", String(args.min_ytm));
        // Skip args.fields — Gemini often guesses invalid field names causing 400s
        params.set("has_pricing", "true");
        params.set("limit", String(args.limit ?? 10));
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/bonds?${params}`,
          { headers }
        );
        break;
      }

      case "search_documents": {
        const params = new URLSearchParams();
        const q = String(args.query ?? "").trim();
        params.set("q", q.length >= 2 ? q : String(args.section_type ?? args.ticker ?? "debt"));
        if (args.ticker) params.set("ticker", normalizeTicker(String(args.ticker)));
        if (args.section_type)
          params.set("section_type", String(args.section_type));
        params.set("limit", String(args.limit ?? 10));
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/documents/search?${params}`,
          { headers }
        );
        break;
      }

      case "get_changes": {
        const ticker = normalizeTicker(String(args.ticker ?? ""));
        const since = String(args.since ?? "");
        const params = new URLSearchParams();
        if (since) params.set("since", since);
        response = await fetchWithTimeout(
          `${BACKEND_URL}/v1/companies/${ticker}/changes?${params}`,
          { headers }
        );
        break;
      }

      case "research_company": {
        const ticker = normalizeTicker(String(args.ticker ?? ""));
        const companyName = args.company_name ? String(args.company_name) : undefined;
        // Use internal URL to avoid routing through public internet
        const port = process.env.PORT || "3000";
        const internalUrl = process.env.INTERNAL_API_URL || `http://localhost:${port}`;
        response = await fetchWithTimeout(
          `${internalUrl}/api/chat/research`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticker, company_name: companyName }),
          },
          RESEARCH_TIMEOUT_MS
        );
        break;
      }

      default:
        return { data: null, cost: 0, error: `Unknown tool: ${toolName}` };
    }

    if (!response.ok) {
      const status = response.status;
      let message: string;
      try {
        const errBody = await response.json();
        message = errBody.detail || errBody.error || response.statusText;
      } catch {
        message = response.statusText;
      }

      if (status === 401) {
        return {
          data: null,
          cost: 0,
          error: "Invalid API key. Please regenerate your key from the dashboard.",
        };
      }
      if (status === 402) {
        return {
          data: null,
          cost: 0,
          error: "No credits remaining. Please purchase more credits or upgrade your plan.",
        };
      }
      if (status === 429) {
        return {
          data: null,
          cost: 0,
          error: "Rate limit exceeded. Please wait a moment and try again.",
        };
      }
      return { data: null, cost: 0, error: `API error (${status}): ${message}` };
    }

    const data = await response.json();
    return { data: truncateResults(data), cost };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      const timeoutSec = toolName === "research_company" ? RESEARCH_TIMEOUT_MS / 1000 : TIMEOUT_MS / 1000;
      return { data: null, cost: 0, error: `Request timed out (${timeoutSec}s). Please try again.` };
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return { data: null, cost: 0, error: `Failed to call DebtStack API: ${message}` };
  }
}
