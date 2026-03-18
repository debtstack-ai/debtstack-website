---
description: >
  Analyze covenant protections and headroom. Use when user asks about
  "covenant headroom", "financial tests", "covenant analysis", "how close
  to breaching covenants?", "cov-lite", "restricted payments basket",
  or any question about creditor protections and covenant structure.
allowed-tools:
  - search_covenants
  - analyze_financials
  - search_documents
  - search_companies
  - search_bonds
---

# Covenant Deep Dive

## Tool Sequence

1. **`search_covenants`** — all covenant data for the company
2. **`analyze_financials`** — current metric values for headroom calculation
3. **`search_companies`** — leverage ratio, coverage ratio for cross-reference
4. **`search_documents`** with `section_type=covenants` or `section_type=credit_agreement` — source language for nuance
5. **`search_bonds`** — which instruments are governed by which covenants

## Covenant Classification

### Maintenance covenants (tested periodically)
- Company must **continuously maintain** the metric at the required level
- Tested quarterly (usually trailing four quarters)
- Breach triggers default/acceleration unless waived or cured
- More protective for creditors — company can't wait until it needs money to comply
- Typical in bank loans (revolvers, term loan A)

### Incurrence covenants (tested only on action)
- Company must **only pass the test when it takes an action** (new debt, dividend, asset sale)
- If metrics deteriorate passively (EBITDA declines), no breach — only if the company tries to lever up further
- Weaker protection — company can deteriorate without triggering
- Typical in high-yield bond indentures (cov-lite)

**Always note which type applies.** A leverage covenant at 5.0x maintenance is very different from 5.0x incurrence.

## Headroom Calculation

For each financial covenant:

```
Headroom = (Threshold - Current Metric) / Threshold × 100%
```

| Covenant | Threshold | Current | Headroom | Room |
|----------|-----------|---------|----------|------|
| Max leverage | 5.0x | 4.2x | 16% | ~$XXM EBITDA decline |
| Min coverage | 2.0x | 2.8x | 40% | Comfortable |

**Translate to dollar terms**: "The company has 16% headroom on its leverage covenant — EBITDA could decline by ~$XXM before tripping the 5.0x test."

### Headroom assessment
- **>30%**: Comfortable. Multiple quarters of deterioration before breach.
- **15-30%**: Adequate but watch. One bad quarter could get uncomfortable.
- **<15%**: Tight. Flag this prominently. One meaningful earnings miss triggers breach.
- **<5%**: Critical. The company is essentially at the covenant level.

## Key Covenant Features

### Step-downs
Some covenants tighten over time (e.g., max leverage drops from 5.0x to 4.5x to 4.0x). If `has_step_down=true`, note the schedule and when the next step-down hits. Headroom narrows automatically even if metrics are flat.

### Baskets
- **Restricted payments basket**: How much cash the company can pay out as dividends, buybacks, or distributions to holdco. Larger baskets = weaker protection.
- **Debt incurrence basket**: How much additional debt the company can take on. Check for carve-outs (e.g., "plus $XXM for general corporate purposes").
- **Asset sale basket**: Proceeds from asset sales may need to be used to repay debt (mandatory prepayment) or may be retained.

### Cov-lite identification
If a credit has **only incurrence covenants** (no maintenance tests):
- State clearly: "This is a cov-lite structure — the company has no ongoing financial maintenance tests."
- Note that creditors have limited ability to force action if the business deteriorates
- The J.Crew/Nine West pattern: cov-lite + unrestricted subsidiary capacity = ability to move assets beyond creditor reach

### Cure rights
Some covenants allow equity cure — the company (or its sponsor) can inject equity to cure a breach. If `cure_period_days` is present, note it. Sponsor-backed companies often have 2-3 equity cure rights.

## Trap Door Risk

When you see incurrence-only covenants combined with:
- Large unrestricted subsidiary baskets
- Broad "permitted investment" definitions
- Weak or no limitations on affiliate transactions

Flag this as **trap door risk** — the company can transfer valuable assets to unrestricted subsidiaries, out of reach of creditors, without triggering any covenant test. Reference J.Crew (IP transfer) and Nine West (brand transfer) as examples.

## Data Gaps

| Tool returns empty | Impact | Alternative |
|--------------------|--------|-------------|
| `search_covenants` empty | No structured covenant data at all. | Try `search_documents` with `section_type=credit_agreement` or `section_type=covenants` for raw language. If also empty: "No covenant data available for [Company] — the company may have cov-lite structures or DebtStack hasn't extracted covenants from their agreements yet." |
| `analyze_financials` empty | Can't calculate headroom. | Use aggregate metrics from `search_companies` (leverage, coverage). Headroom calculation will be approximate. |
| `search_documents` empty | No source agreement language. | Work with structured covenant data only. Note: "Source agreement language not available — can't verify exact definitions or basket sizes." |
| `search_companies` empty | No base metrics for headroom. | Offer `research_company`. Stop. |
| `search_bonds` empty | Can't identify which instruments are governed by which covenants. | Present covenants without instrument linkage. |
