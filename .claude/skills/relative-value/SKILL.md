---
description: >
  Compare bonds or credits for relative value. Use when user asks "which bond
  should I buy?", "best risk/reward", "cheap vs rich", "relative value",
  "compare these bonds", "best investment in X sector", or any question
  about which instrument offers better value.
allowed-tools:
  - search_companies
  - search_bonds
  - analyze_valuation
  - get_cds_spreads
  - compare_peers
  - search_ratings
  - search_pricing
  - resolve_bond
  - get_etf_flows
---

# Relative Value Analysis

## Tool Sequence

**IMPORTANT: Never call `search_bonds` or `search_pricing` with just a sector and no tickers. These calls time out on broad queries. Always narrow to specific tickers first.**

### When user asks about a specific set of bonds/companies:
1. **`search_companies`** with tickers — credit profile for each issuer
2. **`search_bonds`** with tickers + `has_pricing=true` — stack with pricing
3. **`compare_peers`** — side-by-side metrics with rankings
4. **`search_ratings`** with `latest=true` — rating comparison

### When user asks about a sector (e.g., "undervalued bonds in energy"):
1. **`search_companies`** with `sector` filter + `sort=-net_leverage_ratio` + `limit=10` — get the top companies first
2. Pick 3-5 most interesting tickers from the results
3. **`search_bonds`** with those specific tickers + `has_pricing=true` — now scoped and fast
4. **`compare_peers`** with those tickers — rankings
5. **`search_ratings`** — rating context
5. **`get_cds_spreads`** — CDS spread levels for market-implied risk comparison

## Relative Value Framework

### 1. Spread vs fundamentals
The core question: is the spread compensation adequate for the credit risk?
- Compare spread (from `search_bonds` or `get_cds_spreads`) to leverage and coverage metrics
- A BB credit at 400bps with 3x leverage is tighter than a BB at 400bps with 5x leverage — the second is cheaper
- Look at FCF trend — a credit that's deleveraging is worth a tighter spread than one that's re-leveraging

### 2. Rating-adjusted spread
- Compare spread to rating bucket medians: is the bond wide or tight for its rating?
- Wide for rating + improving fundamentals = potential compression trade
- Tight for rating + deteriorating fundamentals = potential blow-up risk
- Cross-agency split ratings (e.g., BBB-/Ba1) often trade wide — the market prices the lower rating

### 3. Curve positioning
- **Short-dated bonds** (1-3yr): Lower spread but lower duration risk. Best for carry trades.
- **Belly of the curve** (3-7yr): Typically best risk/reward. Enough spread without excessive duration.
- **Long-dated bonds** (7-10yr+): Highest spread but most rate sensitivity. Only if you have a strong credit view.
- Check if the credit curve is inverted — short bonds cheaper than long can signal near-term event risk.

### 4. Secured vs unsecured differential
- Normal spread differential: 100-200bps for investment grade, 200-400bps for high yield
- If differential is very wide (>500bps): market is pricing real subordination risk
- If differential is very tight (<100bps): guaranteed bonds may offer secured-like recovery at unsecured-like spreads

### 5. Cross-issuer comparison
Within the same sector:
- Same rating, same leverage — which bond pays more spread? That's the cheaper one.
- Different ratings — normalize for rating. A 5x leveraged BB at 350bps vs a 4x leveraged BBB at 200bps: the BB offers ~150bps more for ~1x more leverage.

## Data Gaps

| Tool returns empty | Impact | Alternative |
|--------------------|--------|-------------|
| `search_companies` empty | Can't compare credit profiles. | Offer `research_company`. Can't do relative value without fundamentals. |
| `search_bonds` — no pricing | Can't compare spreads or yields. | Present debt stack without pricing. Note: "No market pricing — relative value assessment is based on fundamentals only." |
| `search_ratings` empty | Can't do rating-adjusted spread analysis. | Use leverage as proxy for credit quality. Note which companies lack ratings. |
| `get_cds_spreads` empty | No CDS-level comparison. | Use bond YTM spreads instead. Less precise but directionally useful. |
| `compare_peers` empty | No peer rankings. | Compare manually from `search_companies` data. |
| `resolve_bond` — no match | Can't identify the specific bond user asked about. | Ask for CUSIP, issuer name, or maturity year. |
| `get_etf_flows` empty | No technicals context. | Skip. Flows are supplementary to relative value. |

## Always State a View

Don't just present data — make a recommendation:
- "The 2029s offer the best risk/reward in AAL's stack — enough spread to compensate for BB risk, with manageable duration."
- "Between DAL and UAL, DAL's 2030 unsecured notes are 50bps tighter but the credit is meaningfully stronger — DAL is the better risk-adjusted hold."
- "At 280bps, CHTR 4.5% 2032s are fair value. You're not getting paid extra for the leverage — pass unless you're bullish on cable deleveraging."
