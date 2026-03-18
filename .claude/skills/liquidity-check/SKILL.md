---
description: >
  Assess a company's liquidity position and cash runway. Use when user asks
  "does X have enough cash?", "liquidity position", "maturity wall",
  "cash runway", "can X refinance?", "near-term maturities",
  or any question about a company's ability to meet obligations.
allowed-tools:
  - search_companies
  - analyze_liquidity
  - search_bonds
  - get_cds_spreads
  - analyze_financials
  - search_ratings
---

# Liquidity Check

## Tool Sequence

1. **`analyze_liquidity`** — cash, revolver capacity, maturity schedule, coverage ratio, runway assessment
2. **`search_companies`** — leverage, maturity fields (`debt_due_1yr`, `nearest_maturity`), risk flags
3. **`search_bonds`** — instrument-level maturities, filter `maturity_before` for near-term
4. **`analyze_financials`** — FCF trajectory, cash flow generation adequacy
5. **`get_cds_spreads`** with `tenor=5Y` — market access signal
6. **`search_ratings`** with `latest=true` — rating downgrades affect market access

## Liquidity Assessment Framework

### 1. Current liquidity sources
From `analyze_liquidity`:
- **Cash on hand**: Immediate availability
- **Undrawn revolver capacity**: Committed facility the company can draw on. Check if there's a springing financial covenant that could limit access.
- **Total liquidity = Cash + Undrawn revolver**

### 2. Near-term cash needs
- **Maturities**: What's due in 6/12/24/36 months? From `analyze_liquidity` maturity schedule.
- **Interest expense**: Annual cash interest from current debt load.
- **Capex**: Maintenance capex is non-discretionary. Growth capex can be cut.
- **Working capital**: Seasonal or cyclical needs.

### 3. Coverage adequacy
- **Liquidity coverage ratio**: Total liquidity / next 12 months of maturities
  - >2.0x: Comfortable
  - 1.0-2.0x: Adequate but watch
  - <1.0x: Insufficient — company needs to refinance or raise capital
- **Cash runway**: At current burn rate, how many months until cash runs out?

### 4. Maturity wall analysis
From `search_bonds` with maturity filters:
- **Concentrated maturities**: >25% of total debt maturing within 2 years = maturity wall
- **Staggered maturities**: Spread across years = manageable
- **Upcoming bullets**: Large single-tranche maturities that need to be refinanced in whole
- Present as a timeline: "No maturities until 2027, then $2.5B due in 2027 and $3.1B in 2028"

### 5. Market access assessment
**Can the company refinance? This is the critical question for credits with near-term maturities.**

Signals of market access:
- **CDS spread <300bps**: Market is open. Company can likely issue investment-grade or high-yield bonds.
- **CDS spread 300-500bps**: Market access exists but expensive. New issuance will be at higher coupons.
- **CDS spread 500-800bps**: Difficult. May need secured issuance, asset sales, or bank facilities.
- **CDS spread >800bps**: Market is effectively closed for unsecured issuance. Company needs alternative solutions.

Other market access factors:
- **Recent successful issuance**: If the company issued in the last 6 months, market access is proven.
- **Investment-grade rating**: IG issuers almost always have market access. Downgrade to HY is the risk.
- **Split rating** (IG/HY): Typically can still access IG market but at wider spreads.
- **Negative outlook/CreditWatch**: May not block access but increases cost and reduces demand.

### 6. FCF adequacy
From `analyze_financials`:
- Is free cash flow positive? Can the company organically de-lever?
- FCF / total debt = organic deleveraging pace. >5% annually is meaningful.
- If FCF is negative, the company is burning cash and liquidity is shrinking every quarter.

## Data Gaps

| Tool returns empty | Impact | Alternative |
|--------------------|--------|-------------|
| `search_companies` empty | No base data. | Offer `research_company`. Stop. |
| `analyze_liquidity` empty | No liquidity breakdown. | Use `search_companies` for aggregate maturity fields (`debt_due_1yr`, `nearest_maturity`) and `search_bonds` for instrument-level maturities. Manual but workable. |
| `search_bonds` empty | Can't see instrument-level maturities. | Use aggregate maturity data from `search_companies` and `analyze_liquidity`. Less granular. |
| `get_cds_spreads` empty | Can't assess market access. | Note: "No CDS data — market access can't be assessed from spread levels. Check for recent issuance as an alternative signal." Use bond YTM spreads if available. |
| `analyze_financials` empty | Can't assess FCF adequacy. | Use cash position from `analyze_liquidity` only. Note: "FCF trajectory unavailable — liquidity assessment is point-in-time only." |
| `search_ratings` empty | Can't assess downgrade risk impact. | Skip rating-based market access assessment. Note gap. |

## Synthesis

Summarize as: **"Company has $X.XB of liquidity (cash + revolver) against $X.XB of maturities in the next 24 months. FCF of $X.XB annually covers/doesn't cover the gap. CDS at XXXbps suggests market access is open/constrained. Liquidity is adequate/tight/insufficient."**

If data gaps exist, note them: "CDS spreads not available — market access assessment is based on fundamentals and recent issuance activity only."

Flag the specific risk if there is one:
- "The 2027 maturity wall is the key risk — $3B due with only $1.5B of liquidity"
- "Liquidity is adequate today but FCF is declining — by Q4 the runway shortens to 6 months"
- "No near-term concerns — $4B of liquidity, no maturities until 2029, and positive FCF"
