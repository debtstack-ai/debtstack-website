---
title: "How to Read a Bond Indenture"
date: "2026-03-11"
excerpt: "Bond indentures are 100-200 page legal documents that define the relationship between a company and its bondholders. Most people skip them. That's a mistake. Here's what to look for and why it matters."
author: "DebtStack Team"
---

Bond indentures are dense legal documents, typically 100 to 200 pages, that define the relationship between a company and its bondholders. They specify the terms of the debt, the protections creditors have, and the actions the company is restricted from taking. Most people skip them. That's a mistake.

If you own a bond, the indenture is your contract. It determines what happens when things go well and, more importantly, what happens when they don't. The difference between recovering 70 cents on the dollar and recovering 20 often comes down to provisions buried in these documents.

This isn't a legal treatise. It's a practical guide to the sections that matter most for credit analysis.

## Where to Find Indentures

Indentures are filed with the SEC, usually as exhibits to 8-K filings when new debt is issued. The base indenture establishes the general terms, and supplemental indentures are filed for each new series of notes. You'll also find relevant debt terms in 10-K footnotes (Note to Financial Statements on debt), though these are summaries, not the full contract.

The base indenture is the foundation. It covers the boilerplate — trustee duties, events of default, amendment procedures. The supplemental indenture is where you find the deal-specific terms: coupon, maturity, redemption prices, and any covenants particular to that series.

## The Terms You Already Know

Start with the basics. These are usually on the first few pages of the supplemental indenture:

- **Principal amount**: The total issuance size (e.g., "$500,000,000 aggregate principal amount of 5.25% Senior Notes due 2030")
- **Coupon rate**: Fixed or floating, payment frequency (usually semi-annual for bonds, quarterly for loans)
- **Maturity date**: When the principal must be repaid
- **Seniority**: Senior secured, senior unsecured, or subordinated
- **Issuing entity**: Which legal entity actually issued the debt — this matters more than people think

That last point deserves emphasis. A bond issued by a holding company and a bond issued by an operating subsidiary can both be labeled "senior unsecured," but they sit in very different places in the capital structure. In a restructuring, the opco creditors get paid from opco assets first. The holdco creditors only get what's left after opco debts are satisfied. Same label, different risk.

## Covenants: The Guardrails

Covenants are the section most credit analysts care about. They're the contractual restrictions on what the company can do while the debt is outstanding. There are two types that matter.

**Maintenance covenants** are tested on a schedule, usually quarterly. The company must continuously satisfy the test. If leverage hits 5.1x against a 5.0x covenant, the company is in technical default. Maintenance covenants give creditors early intervention points — the ability to renegotiate terms before a company's situation gets worse.

**Incurrence covenants** are only tested when the company takes a specific action — issuing new debt, paying a dividend, making an acquisition. The company can passively breach the ratio without triggering a default. Incurrence covenants only prevent the company from actively making things worse. They don't force it to fix what's already going wrong.

The distinction is critical. A bond with only incurrence covenants, which is common in high-yield, offers weaker protection than one with maintenance covenants, which is common in bank loans. If you're looking at a "covenant-lite" bond, you should know that means no maintenance financial covenants at all. No quarterly testing, no early warning system. The company can deteriorate significantly before any covenant triggers.

### What Covenants Actually Test

Most financial covenants test some version of these metrics:

- **Total leverage ratio** (Total Debt / EBITDA): The most common test. A covenant might say "Total leverage shall not exceed 5.0x."
- **Interest coverage** (EBITDA / Interest Expense): Can the company service its debt from earnings?
- **Fixed charge coverage** ((EBITDA - Capex) / Fixed Charges): A broader test that accounts for capital expenditure needs.
- **First lien leverage** (First Lien Debt / EBITDA): How much of the senior secured capacity is being used?

When you read a covenant, the first thing to calculate is **headroom** — the gap between the company's current metric and the covenant threshold. If current leverage is 4.2x against a 5.5x covenant, there's 1.3 turns of headroom. That's comfortable. If current leverage is 5.3x against a 5.5x threshold, there's 0.2 turns. One bad quarter trips it.

### Step-Downs

Some covenants tighten over time. Year 1 might allow 6.0x leverage, Year 2 steps down to 5.5x, Year 3 to 5.0x. Step-downs are creditor-friendly. They force the company to deleverage on schedule. When you see step-downs, check whether the company's current trajectory will actually meet the tightening thresholds.

## Negative Covenants: What the Company Can't Do

Beyond financial tests, indentures contain negative covenants that restrict specific actions. The important ones:

**Restricted payments** limit dividends, share buybacks, and payments to equity holders. This protects creditors from value leaking to equity before debt is repaid. Pay attention to the basket size. A $500 million restricted payment basket at a $10 billion revenue company is modest. The same basket at a $1 billion revenue company is enormous.

**Debt incurrence baskets** cap how much additional debt the company can take on. These are often structured as a fixed dollar amount plus a ratio-based test. Generous baskets mean the company can pile on more debt ahead of you in the capital structure.

**Asset sale covenants** require proceeds from asset sales to be used to repay debt rather than distributed to equity. Without this, a company can sell its best assets and hand the cash to shareholders while creditors are left with a weaker business.

**Limitation on liens** restricts the company from pledging assets as collateral for new debt. If you hold unsecured bonds and the company can freely grant liens on its best assets to new lenders, your effective position in the capital structure just got worse.

## Change of Control: What Happens in an M&A

Most investment-grade indentures include a change of control provision. The most common version is the **101 put**: if the company undergoes a change of control, bondholders can put their bonds back to the issuer at 101% of par. This protects against leveraged buyouts that pile additional debt on top of existing bonds.

Some provisions require a **double trigger** — both a change of control and a ratings downgrade before the put right activates. Others include **portability** clauses that allow a change of control without triggering default if certain conditions are met, like pro forma leverage staying below a threshold. Portability is borrower-friendly, and you should note when it's present.

## Guarantees and Collateral

Two sections that directly determine recovery in a restructuring.

**Guarantees**: If operating subsidiaries guarantee the debt, those guarantees give bondholders a direct claim against the subsidiaries' assets, not just the issuing entity. This can bridge the holdco/opco gap described earlier. But not all guarantees are equal. Check whether the guarantors actually hold significant assets. A guarantee from a shell entity with no assets is meaningless. Also check whether guarantees can be released under certain conditions — a ratings-based release, for example, can strip your protection right when you need it most.

**Collateral**: For secured bonds, the indenture specifies what assets back the debt and the lien priority. First lien has priority over second lien on the same collateral pool. If you're looking at a secured bond, understand what the collateral actually is. A first lien on high-value equipment is different from a first lien on goodwill.

## Events of Default

This section defines what constitutes a default and what happens when one occurs. Standard events include failure to pay interest or principal, breach of covenants (after any applicable grace period), cross-default to other debt above a threshold amount, and bankruptcy filing.

The grace period matters. Many indentures give the company 15 to 30 days to cure a covenant breach before it becomes an event of default. Some include **equity cure** provisions that allow a sponsor to inject equity to bring the ratio back into compliance, typically limited to two or three times over the life of the loan.

Cross-default provisions are particularly important. They mean that a default under one debt agreement can trigger defaults across all the company's other debt. This is what causes the "domino effect" in distress situations.

## The Sections Most People Skip (But Shouldn't)

**Amendment and waiver provisions** define how the indenture can be modified after issuance. Most significant changes require consent from holders of a majority in principal amount. Some provisions — changes to payment terms, maturity, or collateral — require unanimous consent. Understanding the threshold matters because in a distress scenario, an activist bondholder with a blocking position can influence the outcome.

**The definition section** at the front of the document is where the real engineering happens. Terms like "Consolidated EBITDA," "Permitted Indebtedness," and "Restricted Payment" are precisely defined, and those definitions often contain add-backs, exclusions, and baskets that significantly expand what the company can do. The definitions can run 30 pages. Most of the important fights in credit end up being about what a defined term actually means.

## Why This Matters: A Real Example

In 2017, J.Crew exploited a single clause in its 101-page credit agreement — Section 7.02(t), an investment basket provision originally designed for overseas tax efficiency. The company used it to transfer $250 million worth of brand trademarks out of the collateral pool and into an unrestricted subsidiary, beyond the reach of its term lenders. Lenders who believed they had a first-priority security interest in J.Crew's most valuable assets found that collateral had been legally removed from their reach, without their consent.

The provision was in the document from day one. Nobody flagged it. Standard covenant screens wouldn't catch it. It took a creative borrower under financial pressure to exploit it, and by then it was too late. After the transfer, J.Crew offered term lenders a three-day window to exchange at par. Over 88% accepted, faced with the alternative of holding now-unsecured claims.

That's the argument for actually reading the indenture. The economics are in the numbers. The risk is in the documents.

## What to Look For: A Checklist

If you're reading an indenture for the first time, here's what to focus on:

1. **Who is the issuer?** Holdco or opco? This determines your structural position.
2. **What are the covenants?** Maintenance or incurrence? What are the thresholds? How much headroom exists today?
3. **What are the negative covenant baskets?** How much additional debt can be incurred? How large is the restricted payment basket relative to the company's size?
4. **Who guarantees the debt?** Do the guarantors hold real assets? Can guarantees be released?
5. **What collateral backs the debt?** If secured, what are the assets and the lien priority?
6. **What triggers a change of control?** Is there a 101 put? Single or double trigger? Is there portability?
7. **What are the cross-default thresholds?** A default elsewhere can cascade.
8. **How can the indenture be amended?** What requires majority consent vs. unanimous consent?
9. **How is EBITDA defined?** The add-backs in the "Consolidated EBITDA" definition can inflate the number significantly relative to reported EBITDA.

You won't get through all of this in one sitting. You don't need to. But knowing where to look, and what questions to ask, puts you ahead of most people who buy bonds based on the yield alone.

You can explore structured covenant data, guarantee chains, and indenture sections for 500+ companies at [debtstack.ai](https://debtstack.ai).
