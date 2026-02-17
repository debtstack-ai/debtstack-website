// lib/chat/tools.ts
// Claude tool definitions for DebtStack API, ported from credible/sdk/debtstack/mcp_server.py

import type Anthropic from "@anthropic-ai/sdk";

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
        fields: {
          type: "string",
          description:
            "Comma-separated fields to return (e.g., 'ticker,name,net_leverage_ratio,total_debt')",
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
      required: [],
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
          description: "Bond seniority level",
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
        fields: {
          type: "string",
          description:
            "Comma-separated fields to return (e.g., 'name,cusip,ticker,pricing')",
        },
        limit: {
          type: "integer",
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
        fields: {
          type: "string",
          description: "Comma-separated fields to return",
        },
        limit: {
          type: "integer",
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
];
