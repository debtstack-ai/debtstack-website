---
description: >
  Assess whether a company is in financial distress. Use when bonds trade
  below $80, leverage exceeds 6x, CDS spreads exceed 500bps, user asks
  "is X in trouble?", "default risk", "distress", "bankruptcy risk",
  or when data from other tools shows stressed credit metrics.
allowed-tools:
  - search_companies
  - analyze_financials
  - search_bonds
  - get_cds_spreads
  - search_covenants
  - search_ratings
  - analyze_liquidity
  - get_changes
  - get_etf_flows
---

# Distress Assessment

## Tool Sequence

1. **`search_companies`** — leverage, coverage, risk flags. Check `net_leverage_ratio`, `interest_coverage`, maturity fields.
2. **`analyze_financials`** — trend direction. Is EBITDA growing or shrinking? FCF trajectory over last 4-8 quarters.
3. **`search_bonds`** — price levels across the stack. Filter `maturity_before` for near-term wall. Look at pricing of secured vs unsecured.
4. **`get_cds_spreads`** with `tenor=5Y` — current spread level + 3-month trend direction.
5. **`search_covenants`** — headroom calculation. Compare thresholds to actual metrics from step 1.
6. **`search_ratings`** with `latest=true` — recent downgrades? Outlook negative? CreditWatch?
7. **`analyze_liquidity`** — cash runway, revolver availability, coverage ratio.

## Classification Framework

**Always classify first. This drives the entire analysis.**

### Capital structure problem on a sound business
- High leverage but stable/growing EBITDA and positive FCF
- The business generates cash — the problem is too much debt on top of it
- Restructuring can fix this: extend maturities, convert debt to equity, negotiate with creditors
- **Pattern**: Caesars Entertainment — operating casinos were profitable, but the LBO debt load was unsustainable

### Secular business decline
- Revenue trending down YoY, industry facing structural headwinds
- Leverage is a symptom, not the cause — even if you wiped the debt, the business is shrinking
- Restructuring alone won't fix this. The question is whether there's a viable business post-restructuring or if it's a liquidation.
- **Pattern**: Toys R Us — retail footprint was a liability in the Amazon era. High leverage accelerated the decline but didn't cause it.

### Liquidity crisis
- Adequate coverage metrics but maturity wall with no market access
- CDS widening >200bps in 3 months signals the market is closing the door
- Time pressure is the driver — the company may be fundamentally OK but can't refinance
- Watch for revolver draws and asset sales as signs of desperation

## Key Thresholds

| Signal | Level | Meaning |
|--------|-------|---------|
| Leverage | >6x | Serious — limited margin for error |
| Interest coverage | <1.5x | Debt service consuming most cash flow |
| Bond price | <$70 | Market pricing meaningful default risk |
| CDS spread | >800 bps | Distressed territory |
| Covenant headroom | <15% | One bad quarter from breach |
| FCF | Negative 2+ quarters | Liquidity countdown has started |
| Rating outlook | Negative/CreditWatch | Agency sees deterioration ahead |

## Red Flags

- **Incurrence-only covenants + unrestricted sub capacity**: The J.Crew trap — company can move assets out of the credit group without tripping any tests. Check for "unrestricted subsidiary" designations and restricted payments basket sizes.
- **Asset sales funding debt service**: When a company sells assets to pay interest, it's cannibalizing itself. Check `get_changes` for asset dispositions.
- **Maturity wall within 18 months + CDS widening**: Refinancing risk. If spreads are wide, the company may not be able to issue new debt to repay maturing obligations.
- **Rating on negative outlook from multiple agencies**: Consensus deterioration view.
- **Revolver fully drawn**: Last resort liquidity. If the revolver is maxed, there's no cushion left.

## Data Gaps — what to do when tools return empty

| Tool returns empty | What to say | Alternative |
|--------------------|-------------|-------------|
| `search_companies` empty | "DebtStack doesn't cover [Company] yet." | Offer `research_company`. Stop — can't assess distress without base data. |
| `analyze_financials` — sparse quarters | "Only [N] quarters available — trends may not be reliable." | Work with what's there but caveat the trajectory assessment. |
| `search_bonds` — no pricing | "No TRACE pricing available — can't assess market-implied distress." | Rely on CDS spreads and fundamental metrics instead. Note the gap. |
| `get_cds_spreads` empty | "No CDS spread data for [Company] — DebtStack covers 111 companies." | Use bond spreads from `search_bonds` as proxy. If neither available, note: "No market pricing signals available — assessment is based on fundamentals only." |
| `search_covenants` empty | "No structured covenant data available." | Check `search_documents` with `section_type=credit_agreement` for raw covenant language. Or note: "Covenant headroom can't be assessed — the company may have cov-lite structures." |
| `search_ratings` empty | "No rating data for [Company] in DebtStack — we cover 367 companies." | Use leverage/coverage metrics and bond pricing to infer credit quality. State: "Based on fundamentals, this credit profiles as roughly [IG/BB/B]." |
| `analyze_liquidity` — no revolver data | "Revolver capacity not available." | Use cash on hand + FCF only. Note liquidity assessment is partial. |
| `get_changes` empty | No trajectory data available. | Infer trajectory from `analyze_financials` QoQ/YoY trends instead. |
| `get_etf_flows` empty | Skip. | ETF flows are supplementary — not having them doesn't impair the distress assessment. |

**Never fill gaps with guessed numbers.** State what data is missing and how it limits the assessment.

## Synthesis

1. **Lead with classification**: "AAL is a stressed credit — this is a capital structure problem on a fundamentally sound airline, not a business in secular decline."
2. **Present evidence**: metrics, pricing, trends, covenant headroom
3. **Note data gaps**: If key data is missing (no pricing, no CDS, no covenants), state how it limits confidence
4. **State trajectory**: improving, stable, or deteriorating — and how fast
5. **Actionable conclusion**: What does this mean for creditors? Is there a trade here, or is this one to avoid?
