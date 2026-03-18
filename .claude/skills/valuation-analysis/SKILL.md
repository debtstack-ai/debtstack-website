---
description: >
  Multi-methodology valuation analysis for a company. Use when user asks
  "what's X worth?", "value X", "fair value", "overvalued/undervalued",
  "implied share price", or any intrinsic value question.
allowed-tools:
  - search_companies
  - analyze_valuation
  - analyze_financials
  - compare_peers
---

# Valuation Analysis

## Tool Sequence

1. **`search_companies`** — get sector, leverage, market context, `is_financial_institution` flag
2. **`analyze_valuation`** with `method=all` — run all methodologies
3. **`analyze_financials`** — earnings quality context (growth trajectory, margin stability)
4. **`compare_peers`** — if user wants relative assessment or if comps look off

## Presenting Results

Present `valuation_summary` as a table:

| Method | Implied Price | vs Current |
|--------|--------------|------------|
| EV/EBITDA comps | $XX.XX | +X% |
| ... | ... | ... |

Always end with a range: "Based on [N] methods, implied fair value is **$X–$Y** vs current **$Z**."

## Interpretation Rules

### When methods cluster (±15%)
State the confidence directly: "All four methods point to $140–$160, suggesting the stock is fairly valued at $152."

### When methods diverge (>30%)
Explain WHY — don't just show the table:
- **EV/EBITDA high + P/E low**: Depreciation-heavy business (airlines, telcos, utilities). EBITDA overstates cash earnings because capex is real. Note it.
- **DCF outlier vs comps**: Check the revenue growth assumption — the model caps at 25% for high-growth names. If the company is growing 40%, DCF is mechanically conservative. Flag it.
- **P/BV high for a bank**: Check if book value includes unrealized losses on held-to-maturity securities (post-2022 rate shock). Stated book may overstate true equity.
- **EV/Revenue very different from EV/EBITDA**: Margin differential vs peers. If margins are temporarily depressed, EV/Revenue may be more representative of normalized value.

### Sector-specific leads
- **Banks** (`is_financial_institution=true`): Lead with P/BV and P/PPNR. State: "EV-based multiples are less meaningful for banks — capital adequacy and book value drive bank valuations."
- **REITs** (`ebitda_type=ffo`): Lead with P/FFO. Note: "GAAP earnings understate REIT profitability because depreciation on appreciating real estate is non-economic."
- **High-growth tech**: EV/Revenue may be primary if company is pre-profit or has rapidly expanding margins.

### DCF caveats
- If implied upside/downside >40%: Always caveat — "The DCF is a rough 5-year model and is highly sensitive to growth and WACC assumptions."
- If FCF is negative: DCF is not computed. State why.
- If revenue is declining: The model caps decline at -10% — actual decline may be steeper.

### Data Gaps — what to do when tools return empty

| Tool returns empty | What to say | Alternative |
|--------------------|-------------|-------------|
| `search_companies` empty | "DebtStack doesn't cover [Company] yet." | Offer `research_company` for live SEC research. Stop — can't run valuation without base data. |
| `analyze_valuation` — no market data | "No market cap data available — valuation multiples and DCF can't be computed." | Present raw financial metrics from `analyze_financials` instead. Note the company may be delisted or recently acquired. |
| `analyze_valuation` — no financials | "No financial data available for valuation." | Check if company was recently added. Suggest checking back later. |
| `analyze_valuation` — DCF missing | "DCF not computed — negative free cash flow makes projections unreliable." | Present comps-only results. Note that negative FCF means the company is burning cash. |
| `analyze_valuation` — no peer comps | "Insufficient sector peers for comps — only [N] peers found." | Present the company's own multiples without implied prices. Note that sector medians aren't meaningful with <3 peers. |
| `compare_peers` empty | "No peers found in this sector." | Skip relative assessment. Present absolute valuation only. |

**Never fill data gaps with guessed numbers or training data.** State what's missing and why.

### Other edge cases
- **Negative EBITDA or negative earnings**: Note which methods are N/A and why. Don't just skip them silently.
- **Peer set too small**: If `peer_comparison` has <3 peers, note that sector medians may not be representative.
