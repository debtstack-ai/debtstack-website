// lib/chat/prompts.ts
// Starter prompt library for the chat assistant

export interface StarterPrompt {
  id: string;
  label: string;
  prompt: string;
  category: "screening" | "deep_dive" | "covenants" | "comparisons";
  icon: string;
}

export const PROMPT_CATEGORIES = {
  screening: { label: "Screening", icon: "🔍" },
  deep_dive: { label: "Deep Dive", icon: "🏢" },
  covenants: { label: "Covenants", icon: "📜" },
  comparisons: { label: "Comparisons", icon: "⚖️" },
} as const;

export const STARTER_PROMPTS: StarterPrompt[] = [
  // Screening
  {
    id: "s1",
    label: "Highest leverage MAG7",
    prompt: "Which MAG7 company has the highest leverage ratio?",
    category: "screening",
    icon: "📊",
  },
  {
    id: "s2",
    label: "High-yield bonds",
    prompt: "Find bonds yielding above 8%",
    category: "screening",
    icon: "💰",
  },
  {
    id: "s3",
    label: "Structural subordination",
    prompt: "Which companies have structural subordination risk?",
    category: "screening",
    icon: "⚠️",
  },
  {
    id: "s4",
    label: "Near-term maturities",
    prompt: "Show me bonds maturing before 2027",
    category: "screening",
    icon: "📅",
  },

  // Deep Dive
  {
    id: "d1",
    label: "RIG bond pricing",
    prompt: "Show me Transocean's bond pricing",
    category: "deep_dive",
    icon: "🛢️",
  },
  {
    id: "d2",
    label: "Apple debt structure",
    prompt: "What's Apple's debt structure and leverage ratio?",
    category: "deep_dive",
    icon: "🍎",
  },
  {
    id: "d3",
    label: "Charter corporate structure",
    prompt: "Show me Charter Communications' corporate structure",
    category: "deep_dive",
    icon: "🏗️",
  },
  {
    id: "d4",
    label: "Tesla bond guarantors",
    prompt: "Who guarantees Tesla's bonds?",
    category: "deep_dive",
    icon: "🔋",
  },
  {
    id: "d5",
    label: "Research GM debt (SEC)",
    prompt: "Research General Motors' debt structure from their SEC filings",
    category: "deep_dive",
    icon: "🔬",
  },

  // Covenants
  {
    id: "c1",
    label: "Charter covenants",
    prompt: "What are Charter Communications' financial covenants?",
    category: "covenants",
    icon: "📋",
  },
  {
    id: "c2",
    label: "Leverage covenant screen",
    prompt: "Find companies with a leverage covenant below 5x",
    category: "covenants",
    icon: "📏",
  },
  {
    id: "c3",
    label: "Change of control",
    prompt: "Search for change of control provisions in RIG's indentures",
    category: "covenants",
    icon: "🔄",
  },

  // Comparisons
  {
    id: "m1",
    label: "Offshore driller leverage",
    prompt: "Compare leverage for RIG, VAL, and DO",
    category: "comparisons",
    icon: "🔧",
  },
  {
    id: "m2",
    label: "Tightest energy covenants",
    prompt: "Which energy company has the tightest financial covenants?",
    category: "comparisons",
    icon: "⛽",
  },
  {
    id: "m3",
    label: "Tech debt comparison",
    prompt: "Compare total debt for AAPL, MSFT, GOOGL, and AMZN",
    category: "comparisons",
    icon: "💻",
  },
];
