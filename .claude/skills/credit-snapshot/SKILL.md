---
description: >
  Standard credit analysis for a company. Use when user asks "analyze X",
  "credit risk of X", "credit profile", "how is X doing?", "tell me about
  X's debt", or any general credit assessment question.
allowed-tools:
  - search_companies
  - search_bonds
  - analyze_financials
  - search_ratings
  - get_cds_spreads
  - search_covenants
  - get_corporate_structure
  - get_guarantors
  - get_changes
  - get_financials
---

# Credit Snapshot

The standard multi-tool credit analysis workflow. Always call at least steps 1-3. Expand based on what you find.

## Tool Sequence

1. **`search_companies`** — leverage, coverage, risk flags, sector. This is always first.
2. **`search_bonds`** — full debt stack with pricing. Yields and spreads tell you what the market thinks.
3. **`analyze_financials`** — ratio analysis + trends. Better than computing from raw financials.
4. **`search_ratings`** with `latest=true, issuer_only=true` — agency view of credit quality.
5. **`get_cds_spreads`** with `tenor=5Y` — market-implied credit risk. Include when available.

### Expand based on risk flags (from step 1)
- `has_structural_sub=true` → call **`get_corporate_structure`** — where does debt sit?
- `has_holdco_debt=true` AND `has_opco_debt=true` → call **`get_guarantors`** for key bonds
- Financial covenants present → call **`search_covenants`** — headroom matters

## Interpretation Framework

### Opening assessment
Lead with a 1-2 sentence verdict. State the rating, leverage, and your view:
"CHTR is a BB-rated leveraged credit at 4.5x net leverage with stable cash flows and a manageable maturity profile."

### Credit metrics — what they mean
- **Leverage 0-3x**: Investment grade territory. Focus on business quality and cash flow stability.
- **Leverage 3-5x**: Leveraged but manageable. Typical for post-LBO companies, cable, telecom.
- **Leverage 5-7x**: Highly leveraged. Margin for error is thin. Watch FCF and coverage.
- **Leverage >7x**: Stress territory. Question is whether the business can support it.
- **Interest coverage >3x**: Comfortable. Company earns well above debt service.
- **Interest coverage 1.5-3x**: Adequate but watch the trend. Any EBITDA decline compresses this fast.
- **Interest coverage <1.5x**: Concerning. The company is close to not covering its interest.

### Connecting the dots
Don't present metrics in isolation. Connect them:
- High leverage + improving FCF trend = deleveraging story (positive)
- High leverage + deteriorating margins = trouble (negative)
- Low leverage + wide spreads = market sees something the balance sheet doesn't (investigate)
- Strong coverage + near-term maturity wall = refinancing question, not credit quality question

### What the bond market is saying
- Secured bonds at par, unsecured at $80 → market expects recovery for secured, haircut for unsecured
- All bonds at par with tight spreads → market is comfortable
- Inverted credit curve (short-dated bonds cheaper than long) → near-term event risk
- Wide spread differential between seniority levels → structural subordination is priced in

## Data Gaps — what to do when tools return empty

| Tool returns empty | What to say | Alternative |
|--------------------|-------------|-------------|
| `search_companies` empty | "DebtStack doesn't cover [Company] yet." | Offer `research_company`. Stop. |
| `search_bonds` empty | "No debt instruments on file." | Still present company metrics from step 1. Note: "The debt stack isn't available — this may be a recently added company." |
| `search_bonds` — no pricing | "No TRACE pricing available for these bonds." | Present the debt stack (amounts, coupons, maturities) without market pricing. Use CDS spreads for market signal if available. |
| `analyze_financials` — sparse | "Only [N] quarters of data — trends may not be reliable." | Present what's available, caveat the trend assessment. |
| `search_ratings` empty | "No rating data in DebtStack for this company." | Infer credit quality from leverage/coverage: "Based on 4.2x leverage and 3.1x coverage, this profiles as a mid-BB credit." Never state a specific agency rating without tool data. |
| `get_cds_spreads` empty | "No CDS spread data — we cover 111 companies." | Use bond YTM spreads from `search_bonds`. Or skip market signal and note the gap. |
| `search_covenants` empty | "No structured covenant data." | Note gap. Check `search_documents` for raw covenant language if question is covenant-specific. |
| `get_corporate_structure` empty | "Corporate structure data not available." | Skip structural subordination assessment. Note the gap if `has_structural_sub` was true. |
| `get_changes` empty | Skip. | Use `analyze_financials` trends for trajectory. |
| `get_financials` empty | "No quarterly financial data available." | Use `search_companies` aggregate metrics (leverage, coverage). Note analysis is limited. |

**Never guess numbers. State what's missing and what it means for the analysis.**

### Bottom line
End with a specific, actionable takeaway. Not "this is a complex credit" — instead: "At 4.5x leverage with $2B of annual FCF and no maturities until 2028, CHTR is a stable BB credit. The 4.5% 2032s at 280bps offer fair value for the risk."
