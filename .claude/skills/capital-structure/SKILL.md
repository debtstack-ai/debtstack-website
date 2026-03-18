---
description: >
  Deep analysis of a company's capital structure and debt stack. Use when user
  asks "break down X's capital structure", "debt stack", "holdco vs opco",
  "structural subordination", "where does the debt sit?", "seniority breakdown",
  or any question about how debt is layered across entities.
allowed-tools:
  - search_companies
  - search_bonds
  - get_corporate_structure
  - get_guarantors
  - analyze_capital_structure
  - search_documents
---

# Capital Structure Analysis

## Tool Sequence

1. **`search_companies`** — total debt, secured/unsecured split, risk flags (`has_structural_sub`, `has_holdco_debt`, `has_opco_debt`)
2. **`analyze_capital_structure`** — seniority breakdown, type breakdown, fixed/floating mix, weighted avg coupon/YTM, maturity profile
3. **`search_bonds`** — full instrument-level detail (issuer_type, seniority, amounts, rates, maturities)
4. **`get_corporate_structure`** — entity hierarchy showing where debt sits
5. **`get_guarantors`** for key bonds — which subsidiaries guarantee which debt

## Analysis Framework

### 1. Seniority waterfall
Present the capital structure as a layered table:

| Priority | Type | Amount | % of Total | Coupon Range |
|----------|------|--------|-----------|--------------|
| 1st Lien Secured | Term Loan B | $X.XB | XX% | L+XXX |
| Sr Unsecured | Notes | $X.XB | XX% | X.X%-X.X% |
| ... | ... | ... | ... | ... |

### 2. Debt location — holdco vs opco
From `get_corporate_structure`:
- **Opco debt with subsidiary guarantees**: Strongest position. Claims on operating assets + guarantees from sister subs.
- **Holdco debt guaranteed by opco**: Effectively pari passu with opco unsecured. Guarantees are key.
- **Holdco debt without guarantees**: Structurally subordinated. Only claim is on holdco's equity in subs — after all opco creditors are satisfied.

Quantify the structural subordination: "$X.XB of holdco debt sits behind $X.XB of opco claims — structurally subordinated by X turns of leverage."

### 3. Fixed vs floating mix
From `analyze_capital_structure`:
- **High floating-rate exposure** (>40%): Interest expense increases directly with rate hikes. Quantify: "Each 100bps rate increase adds $XXM to annual interest expense."
- **Mostly fixed-rate**: Insulated from rate moves but refinancing risk at maturity if rates are higher.
- **Swapped exposure**: Some companies swap floating to fixed — our data shows the contractual rate, not the swapped rate. Note this limitation.

### 4. Maturity profile
Present the year-by-year maturity schedule from `analyze_capital_structure`:
- **Maturity wall**: Concentration of maturities in a single year. Flag if >25% of total debt matures within 2 years.
- **Well-laddered**: Maturities spread across years. Less refinancing risk.
- **Near-term pressure**: Maturities within 12-18 months that need to be addressed. Check if the company has cash + revolver capacity to cover.

### 5. Cost of debt
- Weighted avg coupon tells you the cash cost
- Weighted avg YTM tells you the market's required return
- Wide gap between coupon and YTM → bonds trading at a discount → market demands more than the company is paying
- Very tight YTM → bonds at premium → company's credit has improved since issuance

### 6. Guarantee coverage
From `get_guarantors`:
- What percentage of subsidiary assets/revenue do the guarantors represent?
- Are there material non-guarantor subsidiaries (foreign subs, unrestricted subs, JVs)?
- Guarantor coverage <80% of consolidated revenue = meaningful leakage risk

## Data Gaps

| Tool returns empty | Impact | Alternative |
|--------------------|--------|-------------|
| `search_companies` empty | No base data. | Offer `research_company`. Stop. |
| `analyze_capital_structure` empty | No seniority/maturity/cost breakdown. | Build manually from `search_bonds` instrument-level data. More work but same information. |
| `search_bonds` empty | Can't map the debt stack. | Present aggregate metrics from `search_companies` (total_debt, secured_debt). Note: "Individual instruments not available." |
| `get_corporate_structure` empty | Can't assess holdco/opco debt location. | Note gap. If `has_structural_sub` is true, warn: "Structural subordination flagged but entity hierarchy not available — can't map where debt sits." |
| `get_guarantors` empty | Can't assess guarantee coverage. | Note: "Guarantee data not available — can't assess whether holdco debt benefits from subsidiary guarantees." |
| `search_documents` empty | No source covenant/indenture language. | Proceed with structured data. Note if user needs specific terms, the source documents aren't indexed for this company.
