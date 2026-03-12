// lib/chat/tools.ts
// Gemini tool definitions for DebtStack API, ported from credible/sdk/debtstack/mcp_server.py

import {
  SchemaType,
  type FunctionDeclaration,
} from "@google/generative-ai";

export const DEBTSTACK_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_companies",
    description:
      "Search companies by ticker, sector, leverage ratio, and risk flags. " +
      "Use to find companies with specific characteristics, compare leverage across peers, " +
      "or screen for structural subordination risk. " +
      "Example: 'Find tech companies with leverage above 4x'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Comma-separated tickers (e.g., 'AAPL,MSFT,GOOGL')",
        },
        sector: {
          type: SchemaType.STRING,
          description: "Filter by sector (e.g., 'Technology', 'Energy')",
        },
        min_leverage: {
          type: SchemaType.NUMBER,
          description: "Minimum leverage ratio",
        },
        max_leverage: {
          type: SchemaType.NUMBER,
          description: "Maximum leverage ratio",
        },
        has_structural_sub: {
          type: SchemaType.BOOLEAN,
          description: "Filter for structural subordination",
        },
        sort: {
          type: SchemaType.STRING,
          description:
            "Sort field, prefix with - for descending (e.g., '-net_leverage_ratio')",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 10)",
        },
      },
      required: [],
    },
  },
  {
    name: "search_bonds",
    description:
      "Search bonds by ticker, seniority, yield, spread, and maturity. " +
      "Use for yield hunting, finding high-yield opportunities, or analyzing maturity walls. " +
      "Example: 'Find senior unsecured bonds yielding above 8%'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker(s)",
        },
        seniority: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["senior_secured", "senior_unsecured", "subordinated"],
          description: "Bond seniority level. Use 'senior_secured' for secured bonds, 'senior_unsecured' for unsecured, 'subordinated' for sub debt.",
        },
        min_ytm: {
          type: SchemaType.NUMBER,
          description: "Minimum yield to maturity (%)",
        },
        has_pricing: {
          type: SchemaType.BOOLEAN,
          description: "Only bonds with pricing data",
        },
        maturity_before: {
          type: SchemaType.STRING,
          description: "Maturity before date (YYYY-MM-DD)",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 10)",
        },
      },
      required: [],
    },
  },
  {
    name: "resolve_bond",
    description:
      "Look up a bond by CUSIP, ISIN, or description. " +
      "Use when you have a partial bond identifier and need full details. " +
      "Example: 'RIG 8% 2027' or 'CUSIP 893830AK8'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
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
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        bond_id: {
          type: SchemaType.STRING,
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
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
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
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker(s)",
        },
        cusip: {
          type: SchemaType.STRING,
          description: "Bond CUSIP(s)",
        },
        min_ytm: {
          type: SchemaType.NUMBER,
          description: "Minimum yield to maturity (%)",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 10)",
        },
      },
      required: [],
    },
  },
  {
    name: "search_documents",
    description:
      "Search SEC filing sections for specific terms. " +
      "Section types: debt_footnote, credit_agreement, indenture, covenants, mda_liquidity. " +
      "Use to find covenant language, credit agreement terms, or debt descriptions.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: {
          type: SchemaType.STRING,
          description: "Search terms",
        },
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker(s)",
        },
        section_type: {
          type: SchemaType.STRING,
          format: "enum",
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
          type: SchemaType.INTEGER,
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
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Stock ticker (e.g., 'F', 'GM')",
        },
        company_name: {
          type: SchemaType.STRING,
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
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker (e.g., 'AAL', 'RIG')",
        },
        period: {
          type: SchemaType.STRING,
          description: "Period: 'TTM' (trailing 12 months), 'latest' (most recent quarter), or specific like '2025Q3'",
        },
        limit: {
          type: SchemaType.INTEGER,
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
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker (e.g., 'CHTR', 'AAL')",
        },
        covenant_type: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["financial", "negative", "protective"],
          description: "Filter by covenant type",
        },
        test_metric: {
          type: SchemaType.STRING,
          description: "Filter by test metric (e.g., 'leverage_ratio', 'interest_coverage')",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 10)",
        },
      },
      required: [],
    },
  },
  {
    name: "search_ratings",
    description:
      "Search credit ratings from S&P, Moody's, and Fitch. " +
      "Use to look up credit ratings, screen by rating bucket (IG, HY-BB, HY-B, HY-CCC), " +
      "or compare ratings across companies. " +
      "Example: 'What are Apple's credit ratings?' or 'Which companies are rated BB?'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker(s), comma-separated (e.g., 'AAPL,MSFT')",
        },
        rating_bucket: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["IG", "HY-BB", "HY-B", "HY-CCC", "NR"],
          description: "Rating bucket filter",
        },
        rating_type: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["issuer", "senior_secured", "senior_unsecured", "subordinated", "corporate_family"],
          description: "Rating type filter",
        },
        sp_rating: {
          type: SchemaType.STRING,
          description: "S&P rating filter (e.g., 'BB+', 'BBB-')",
        },
        moodys_rating: {
          type: SchemaType.STRING,
          description: "Moody's rating filter (e.g., 'Ba1', 'Baa3')",
        },
        issuer_only: {
          type: SchemaType.BOOLEAN,
          description: "Show only issuer-level ratings (default false)",
        },
        latest: {
          type: SchemaType.BOOLEAN,
          description: "Return only the most recent rating per company/agency (default false)",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 50)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_cds_spreads",
    description:
      "Get CDS spread time series for companies. " +
      "Returns credit spread levels in basis points derived from TRACE bond pricing. " +
      "Use for credit spread analysis, comparing relative credit risk, or tracking spread trends. " +
      "Example: 'Show me Apple's CDS spreads' or 'Compare 5Y spreads for MAG7'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker(s), comma-separated (e.g., 'AAPL,MSFT')",
        },
        tenor: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["1Y", "3Y", "5Y", "7Y", "10Y"],
          description: "CDS tenor (default 5Y)",
        },
        from_date: {
          type: SchemaType.STRING,
          description: "Start date (YYYY-MM-DD)",
        },
        to_date: {
          type: SchemaType.STRING,
          description: "End date (YYYY-MM-DD)",
        },
        latest_only: {
          type: SchemaType.BOOLEAN,
          description: "Return only most recent spread per company (default false)",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 50)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_etf_flows",
    description:
      "Get ETF fund flow data for credit market sentiment. " +
      "Shows estimated daily flows into/out of major credit ETFs (LQD, HYG, JNK, BND, EMB, etc.). " +
      "Use 'aggregate' view for asset-class-level signals (IG, HY, EM, leveraged loans). " +
      "Example: 'Are investors flowing into HY?' or 'Show me IG fund flows this week'",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        etf_ticker: {
          type: SchemaType.STRING,
          description: "ETF ticker(s), comma-separated (e.g., 'LQD,HYG')",
        },
        asset_class: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["ig", "hy", "leveraged_loan", "em_bond", "broad"],
          description: "Asset class filter",
        },
        from_date: {
          type: SchemaType.STRING,
          description: "Start date (YYYY-MM-DD)",
        },
        to_date: {
          type: SchemaType.STRING,
          description: "End date (YYYY-MM-DD)",
        },
        view: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["etf", "aggregate"],
          description: "View mode: 'etf' for per-ETF data, 'aggregate' for asset-class-level signals (default 'etf')",
        },
        latest_only: {
          type: SchemaType.BOOLEAN,
          description: "Return only most recent data (default false)",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Maximum results (default 50)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_changes",
    description:
      "See what changed in a company's debt structure since a date. " +
      "Returns new issuances, matured debt, leverage changes, and pricing movements. " +
      "Use to monitor companies for material changes.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticker: {
          type: SchemaType.STRING,
          description: "Company ticker",
        },
        since: {
          type: SchemaType.STRING,
          description: "Compare since date (YYYY-MM-DD)",
        },
      },
      required: ["ticker", "since"],
    },
  },
];
