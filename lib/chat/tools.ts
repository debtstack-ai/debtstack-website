// lib/chat/tools.ts
// Anthropic Tool definitions for DebtStack API, converted from Gemini FunctionDeclarations
// Original source: credible/sdk/debtstack/mcp_server.py

import Anthropic from "@anthropic-ai/sdk";

export const DEBTSTACK_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_companies",
    description:
      "Search companies by ticker, sector, leverage ratio, and risk flags. " +
      "Use to find companies with specific characteristics, compare leverage across peers, " +
      "or screen for structural subordination risk. " +
      "Example: 'Find tech companies with leverage above 4x'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Comma-separated tickers (e.g., 'AAPL,MSFT,GOOGL')",
        },
        sector: {
          type: "string",
          description: "Filter by sector (e.g., 'Technology', 'Energy')",
        },
        min_leverage: {
          type: "number",
          description: "Minimum leverage ratio",
        },
        max_leverage: {
          type: "number",
          description: "Maximum leverage ratio",
        },
        has_structural_sub: {
          type: "boolean",
          description: "Filter for structural subordination",
        },
        sort: {
          type: "string",
          description:
            "Sort field, prefix with - for descending (e.g., '-net_leverage_ratio')",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 10)",
        },
      },
    },
  },
  {
    name: "search_bonds",
    description:
      "Search bonds by ticker, seniority, yield, spread, and maturity. " +
      "Use for yield hunting, finding high-yield opportunities, or analyzing maturity walls. " +
      "Example: 'Find senior unsecured bonds yielding above 8%'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker(s)",
        },
        seniority: {
          type: "string",
          enum: ["senior_secured", "senior_unsecured", "subordinated"],
          description: "Bond seniority level. Use 'senior_secured' for secured bonds, 'senior_unsecured' for unsecured, 'subordinated' for sub debt.",
        },
        min_ytm: {
          type: "number",
          description: "Minimum yield to maturity (%)",
        },
        has_pricing: {
          type: "boolean",
          description: "Only bonds with pricing data",
        },
        maturity_before: {
          type: "string",
          description: "Maturity before date (YYYY-MM-DD)",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 10)",
        },
      },
    },
  },
  {
    name: "resolve_bond",
    description:
      "Look up a bond by CUSIP, ISIN, or description. " +
      "Use when you have a partial bond identifier and need full details. " +
      "Example: 'RIG 8% 2027' or 'CUSIP 893830AK8'",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Bond identifier - CUSIP, ISIN, or description (e.g., 'RIG 8% 2027')",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_guarantors",
    description:
      "Find all entities that guarantee a bond. " +
      "Use to understand guarantee coverage and structural subordination risk. " +
      "Pass a CUSIP or bond description.",
    input_schema: {
      type: "object" as const,
      properties: {
        bond_id: {
          type: "string",
          description: "Bond CUSIP or identifier",
        },
      },
      required: ["bond_id"],
    },
  },
  {
    name: "get_corporate_structure",
    description:
      "Get the full corporate structure for a company. " +
      "Shows parent-subsidiary hierarchy, entity types, and debt at each level. " +
      "Use to understand structural subordination and where debt sits in the org.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'RIG', 'CHTR')",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "search_pricing",
    description:
      "Get bond pricing from FINRA TRACE. " +
      "Returns current price, yield to maturity, and spread to treasury. " +
      "Use to find distressed bonds or compare relative value.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker(s)",
        },
        cusip: {
          type: "string",
          description: "Bond CUSIP(s)",
        },
        min_ytm: {
          type: "number",
          description: "Minimum yield to maturity (%)",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 10)",
        },
      },
    },
  },
  {
    name: "search_documents",
    description:
      "Search SEC filing sections for specific terms. " +
      "Section types: debt_footnote, credit_agreement, indenture, covenants, mda_liquidity. " +
      "Use to find covenant language, credit agreement terms, or debt descriptions.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search terms",
        },
        ticker: {
          type: "string",
          description: "Company ticker(s)",
        },
        section_type: {
          type: "string",
          enum: [
            "debt_footnote",
            "credit_agreement",
            "indenture",
            "covenants",
            "mda_liquidity",
            "exhibit_21",
            "guarantor_list",
          ],
          description: "Section type to search",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "research_company",
    description:
      "Research a company NOT in DebtStack by fetching its latest SEC 10-K filing " +
      "and extracting debt instruments. ONLY use when: (1) the user explicitly asks " +
      "to research a non-covered company, AND (2) search_companies returned no data. " +
      "Results are live SEC filing research, NOT DebtStack database data.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker (e.g., 'F', 'GM')",
        },
        company_name: {
          type: "string",
          description: "Full company name (optional, helps with identification)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "get_financials",
    description:
      "Get quarterly financial statements for a company. " +
      "Returns revenue, EBITDA, cash, total debt, operating income, capex, and more. " +
      "Use period='TTM' for trailing twelve months, 'latest' for most recent quarter. " +
      "Essential for assessing earnings trajectory, cash position, and deleveraging progress.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'AAL', 'RIG')",
        },
        period: {
          type: "string",
          description: "Period: 'TTM' (trailing 12 months), 'latest' (most recent quarter), or specific like '2025Q3'",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 4 for quarterly history)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "search_covenants",
    description:
      "Search structured covenant data for a company. " +
      "Returns financial covenants (leverage tests, coverage ratios), negative covenants, " +
      "and protective covenants. Use to assess covenant headroom and how close a company " +
      "is to breaching its financial tests.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'CHTR', 'AAL')",
        },
        covenant_type: {
          type: "string",
          enum: ["financial", "negative", "protective"],
          description: "Filter by covenant type",
        },
        test_metric: {
          type: "string",
          description: "Filter by test metric (e.g., 'leverage_ratio', 'interest_coverage')",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 10)",
        },
      },
    },
  },
  {
    name: "search_ratings",
    description:
      "Search credit ratings from S&P, Moody's, and Fitch. " +
      "Use to look up credit ratings, screen by rating bucket (IG, HY-BB, HY-B, HY-CCC), " +
      "or compare ratings across companies. " +
      "Example: 'What are Apple's credit ratings?' or 'Which companies are rated BB?'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker(s), comma-separated (e.g., 'AAPL,MSFT')",
        },
        rating_bucket: {
          type: "string",
          enum: ["IG", "HY-BB", "HY-B", "HY-CCC", "NR"],
          description: "Rating bucket filter",
        },
        rating_type: {
          type: "string",
          enum: ["issuer", "senior_secured", "senior_unsecured", "subordinated", "corporate_family"],
          description: "Rating type filter",
        },
        sp_rating: {
          type: "string",
          description: "S&P rating filter (e.g., 'BB+', 'BBB-')",
        },
        moodys_rating: {
          type: "string",
          description: "Moody's rating filter (e.g., 'Ba1', 'Baa3')",
        },
        issuer_only: {
          type: "boolean",
          description: "Show only issuer-level ratings (default false)",
        },
        latest: {
          type: "boolean",
          description: "Return only the most recent rating per company/agency (default false)",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 50)",
        },
      },
    },
  },
  {
    name: "get_cds_spreads",
    description:
      "Get CDS spread time series for companies. " +
      "Returns credit spread levels in basis points derived from TRACE bond pricing. " +
      "Use for credit spread analysis, comparing relative credit risk, or tracking spread trends. " +
      "Example: 'Show me Apple's CDS spreads' or 'Compare 5Y spreads for MAG7'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker(s), comma-separated (e.g., 'AAPL,MSFT')",
        },
        tenor: {
          type: "string",
          enum: ["1Y", "3Y", "5Y", "7Y", "10Y"],
          description: "CDS tenor (default 5Y)",
        },
        from_date: {
          type: "string",
          description: "Start date (YYYY-MM-DD)",
        },
        to_date: {
          type: "string",
          description: "End date (YYYY-MM-DD)",
        },
        latest_only: {
          type: "boolean",
          description: "Return only most recent spread per company (default false)",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 50)",
        },
      },
    },
  },
  {
    name: "get_etf_flows",
    description:
      "Get ETF fund flow data for credit market sentiment. " +
      "Shows estimated daily flows into/out of major credit ETFs (LQD, HYG, JNK, BND, EMB, etc.). " +
      "Use 'aggregate' view for asset-class-level signals (IG, HY, EM, leveraged loans). " +
      "Example: 'Are investors flowing into HY?' or 'Show me IG fund flows this week'",
    input_schema: {
      type: "object" as const,
      properties: {
        etf_ticker: {
          type: "string",
          description: "ETF ticker(s), comma-separated (e.g., 'LQD,HYG')",
        },
        asset_class: {
          type: "string",
          enum: ["ig", "hy", "leveraged_loan", "em_bond", "broad"],
          description: "Asset class filter",
        },
        from_date: {
          type: "string",
          description: "Start date (YYYY-MM-DD)",
        },
        to_date: {
          type: "string",
          description: "End date (YYYY-MM-DD)",
        },
        view: {
          type: "string",
          enum: ["etf", "aggregate"],
          description: "View mode: 'etf' for per-ETF data, 'aggregate' for asset-class-level signals (default 'etf')",
        },
        latest_only: {
          type: "boolean",
          description: "Return only most recent data (default false)",
        },
        limit: {
          type: "integer",
          description: "Maximum results (default 50)",
        },
      },
    },
  },
  {
    name: "get_changes",
    description:
      "See what changed in a company's debt structure since a date. " +
      "Returns new issuances, matured debt, leverage changes, and pricing movements. " +
      "Use to monitor companies for material changes.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker",
        },
        since: {
          type: "string",
          description: "Compare since date (YYYY-MM-DD)",
        },
      },
      required: ["ticker", "since"],
    },
  },

  // ─── Analysis / Compute Tools ────────────────────────────────────────
  {
    name: "analyze_financials",
    description:
      "Compute financial ratio analysis with trends for a company. " +
      "Returns profitability (margins, ROE, ROA), solvency (D/E, D/A), " +
      "efficiency (asset turnover), cash flow (FCF, FCF/debt), " +
      "QoQ/YoY growth, and trend classification. " +
      "Prefer this over manually computing ratios from get_financials. " +
      "Example: 'Analyze AAL's financial trends'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'AAL', 'AAPL')",
        },
        quarters: {
          type: "integer",
          description: "Number of quarters to analyze (default 8, max 12)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "analyze_liquidity",
    description:
      "Assess a company's liquidity position. " +
      "Returns cash, revolver capacity, maturity schedule (6m/12m/24m/36m), " +
      "liquidity coverage ratio, cash runway, and overall assessment. " +
      "Example: 'How is AAL's liquidity?' or 'Does RIG have enough cash?'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'AAL', 'RIG')",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "analyze_capital_structure",
    description:
      "Analyze a company's debt stack in detail. " +
      "Returns seniority breakdown, type breakdown, fixed/floating mix, " +
      "weighted avg coupon and YTM, year-by-year maturity profile, " +
      "and D/E ratio. " +
      "Example: 'Break down CHTR's capital structure'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'CHTR', 'AAL')",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "analyze_valuation",
    description:
      "Multi-methodology valuation with implied share prices. " +
      "Returns up to 7 methods: EV/EBITDA comps, EV/Revenue comps, P/E comps, " +
      "P/BV comps, P/PPNR comps (banks), P/FFO comps (REITs), and DCF. " +
      "Each method produces an implied share price with % vs current. " +
      "Use for 'what's it worth?' questions. " +
      "Example: 'What's AAPL worth?' or 'Value JPM'",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: {
          type: "string",
          description: "Company ticker (e.g., 'AAPL', 'MSFT')",
        },
        method: {
          type: "string",
          enum: ["comps", "dcf", "all"],
          description: "Valuation method: 'comps' (multiples only), 'dcf' (DCF only), 'all' (both, default)",
        },
      },
      required: ["ticker"],
    },
  },
  {
    name: "compare_peers",
    description:
      "Side-by-side peer comparison across companies. " +
      "Returns key metrics (leverage, margins, coverage, FCF, EV/EBITDA, spreads, ratings) " +
      "with per-metric rankings. Pass tickers or a sector. " +
      "Example: 'Compare AAL vs DAL vs UAL' or 'Compare airline companies'",
    input_schema: {
      type: "object" as const,
      properties: {
        tickers: {
          type: "string",
          description: "Comma-separated tickers, up to 10 (e.g., 'AAL,DAL,UAL')",
        },
        sector: {
          type: "string",
          description: "Find peers by sector (e.g., 'Airlines', 'Technology')",
        },
        limit: {
          type: "integer",
          description: "Number of companies (default 5, max 10)",
        },
      },
    },
  },
];
