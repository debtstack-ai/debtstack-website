---
description: >
  Analyze recovery prospects and identify the fulcrum security in a company's
  capital structure. Use when user asks about "recovery", "fulcrum security",
  "waterfall analysis", "what would creditors get?", "restructuring recovery",
  or when analyzing where value breaks in a distressed capital structure.
allowed-tools:
  - search_companies
  - search_bonds
  - get_corporate_structure
  - get_guarantors
  - analyze_capital_structure
  - search_pricing
  - search_covenants
  - resolve_bond
---

# Recovery Analysis

## Tool Sequence

1. **`search_companies`** — total debt, EBITDA, enterprise value context
2. **`analyze_capital_structure`** — full seniority breakdown with amounts at each level
3. **`search_bonds`** with `has_pricing=true` — market prices reveal implied recovery expectations
4. **`get_corporate_structure`** — where does debt sit? Holdco vs opco matters for recovery.
5. **`get_guarantors`** for key bonds — guarantee coverage is the difference between secured recovery and unsecured recovery
6. **`search_pricing`** — detailed price/yield/spread for cross-tranche comparison

## Waterfall Analysis

Build the claims waterfall from the capital structure data:

### Priority of claims (top = paid first)
1. **DIP financing** (if in bankruptcy — not in our data, but mention if relevant)
2. **Administrative claims** (professional fees, 503(b)(9) trade claims)
3. **First lien secured debt** — term loans, first lien notes. Collateral backing.
4. **Second lien secured debt** — junior secured claims
5. **Senior unsecured notes** — typically the largest tranche in leveraged credits
6. **Subordinated notes** — junior unsecured
7. **Holdco debt** (structurally subordinated) — if debt sits at parent with no subsidiary guarantees, it's behind everything at the opco level
8. **Equity** — last in line, first to be wiped out

### Identifying the fulcrum security
The fulcrum is where enterprise value equals cumulative claims — the tranche that is partially impaired:

- Sum claims from the top of the waterfall down
- Where cumulative claims exceed estimated enterprise value, that tranche is the fulcrum
- Everything above the fulcrum recovers in full (par)
- The fulcrum tranche recovers partially (enterprise value minus senior claims, divided by fulcrum tranche size)
- Everything below the fulcrum recovers zero

**Enterprise value estimate**: Use EV/EBITDA from `analyze_valuation` or a distressed multiple (4-6x for most industries, 6-8x for asset-light businesses).

## Bond Price Signals

Market prices embed recovery expectations:
- **$90-100**: Market expects full recovery. No credit concern at this level.
- **$70-90**: Some credit risk priced in but expecting near-full recovery.
- **$40-70**: Partial recovery expected. This tranche is likely near or at the fulcrum.
- **$20-40**: Significant impairment expected. Below the fulcrum.
- **$0-20**: Market expects minimal recovery. Deep subordination or equity-like risk.

### Cross-tranche comparison
Compare prices across the capital structure:
- If 1st lien at $95 and unsecured at $45 → fulcrum is between them
- If all debt trades at $60-70 → enterprise value may cover most claims partially (wide waterfall)
- If secured at par and unsecured at $10 → sharp value break, clear fulcrum at unsecured level

## Structural Subordination Impact

From `get_corporate_structure` and `get_guarantors`:

- **Holdco-only debt without subsidiary guarantees**: Structurally subordinated to all opco claims. Recovery depends on equity value of subsidiaries after opco creditors are satisfied.
- **Guaranteed by opco subsidiaries**: Effectively ranks pari passu with opco unsecured — guarantees pull the holdco claim into the opco waterfall.
- **Unrestricted subsidiaries**: Assets held in unrestricted subs may not be available for creditor claims. Reduce estimated enterprise value accordingly.
- **VIEs**: Consolidated for accounting but may not be available in bankruptcy. Flag if material.

## Data Gaps

| Tool returns empty | Impact | Alternative |
|--------------------|--------|-------------|
| `search_companies` empty | Can't estimate EV. | Offer `research_company`. Stop. |
| `analyze_capital_structure` empty | Can't build waterfall. | Use `search_bonds` to construct seniority breakdown manually from instrument-level data. |
| `search_bonds` — no pricing | Can't cross-check recovery with market prices. | Present waterfall and fulcrum estimate from fundamentals only. Note: "No market pricing to confirm recovery expectations." |
| `get_corporate_structure` empty | Can't assess structural subordination. | Note gap. If `has_structural_sub` flag is true, warn: "Structural subordination may exist but can't be mapped without entity data." |
| `get_guarantors` empty | Can't assess guarantee coverage. | Note: "Guarantee coverage unknown — recovery estimates assume pari passu treatment across unsecured claims." |
| `search_covenants` empty | Can't assess asset stripping risk. | Note gap. Recovery analysis proceeds without covenant assessment. |
| `resolve_bond` — no match | Can't identify specific bond. | Ask user for more detail (CUSIP, issuer, maturity year). |

## Synthesis

1. **Build the waterfall**: List each tranche with amount and cumulative total
2. **Estimate enterprise value**: Use peer multiples on current or normalized EBITDA
3. **Identify the fulcrum**: Where does value run out?
4. **Cross-check with market prices**: Do bond prices confirm your waterfall analysis?
5. **Note data gaps**: Flag any missing structural, guarantee, or pricing data that limits confidence
6. **State recovery estimates**: "First lien: ~100% recovery. Senior unsecured: ~45 cents on the dollar. Subordinated: ~0."
