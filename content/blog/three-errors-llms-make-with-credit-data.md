---
title: "3 Errors LLMs Make When Processing Credit Data"
date: "2026-02-25"
excerpt: "We've been running LLMs against SEC filings for a while now. We used different LLMs to extract complex credit data from hundreds of companies, thousands of 10-Ks, indentures, credit agreements"
author: "DebtStack Team"
---

We've been running LLMs against SEC filings for a while now. We used different LLMs to extract complex credit data from hundreds of companies, thousands of 10-Ks, indentures, credit agreements. 

The models are genuinely impressive at this. Most of the time they get it right. But when they get it wrong, they get it wrong in ways that are worth studying, because the failure modes tell you something important about how these models process financial documents.

We want to share three error patterns we've observed in our work so far. If you work with LLMs and financial data, you'll probably recognize some of these. None of this is to say that the models won't get better with time. We did see much better performance from the more expensive LLMs - you get what you pay for! And if they continue to get better, a lot of these errors will eventually disappear.

## Phantom debt

When a model can't find a specific piece of data in a filing, it sometimes fills the gap with fabricated data. This data often looks deceptively real i.e. they come with coupon rates, maturity dates, and dollar amounts.

Gilead Sciences was a good case in point. Our extraction using Gemini returned 13 different debt instruments totaling $16.4 billion, which looked right. But we then went back to the 10Ks, 10Qs and 8Ks to verify. None of the debt instruments were there. The model had generated 13 different debt instruments from scratch.

Procter & Gamble showed a more subtle version of this tendency to create phantom financial data. P&G issues bonds denominated in Japanese Yen. One filing describes "0.230% Yen Notes due 2031" with a face value of 50 billion Yen, roughly $330 million USD. But our LLM treated 50 billion Yen as $50 billion USD. One currency misread, $50 billion in phantom debt on a consumer staples company.

Our extraction of Citigroup was interesting. The extraction assigned $317 billion, Citi's entire total debt, to a single 6.625% bond due 2032. Somewhere in the extraction, the model confused a line-item amount with a balance sheet total. 

Given these errors, we had to run checks on every extraction. Every extraction was tested for internal consistency, entity verification, debt verification, completeness, structure verification, and JV/VIE verification. If any of these checks fail, the data gets re-extracted with a different model.

## Missing debt categories

This one is about how literally LLMs follow instructions. Ask a model to "extract all debt instruments" and it will extract what it recognizes as debt instruments, which in practice means bonds. Senior notes, convertible notes, subordinated notes.

Corporate debt structures are broader than that. Airlines finance aircraft through Equipment Trust Certificates. Companies that took COVID relief carry Payroll Support Program loans. Banks issue deposit-backed debt. Airports issue Special Facility Revenue Bonds. Most large companies have term loans and revolving credit facilities. These are all real debt obligations with real credit risk.

Our initial extraction missed all of them.

A good example was extractions we ran for the airline industry. EETCs are how airlines pay for planes. They carry real credit risk, they trade, they have covenants. But because the prompt examples only showed bond-style instruments, the model never looked for them.

The cumulative undercounting of debt across major issuers was around 27 percent. For individual companies it was often worse, 50 percent or more. The model could read the filing perfectly well. It just wasn't told to look for these specific formats.

The takeaway is that, with LLMs, you have to be exhaustive in what you tell the model to look for. We ended up building a taxonomy of 16 instrument types with 50+ variant names. When the extraction prompt explicitly lists term loans, revolving credit facilities, equipment trust certificates, government loans, special facility revenue bonds, and finance leases, coverage jumps dramatically. The model was always capable of extracting them. It just needed to be told they exist.

## Invented detail

This is probably the most interesting error pattern because it reveals something fundamental about how these models handle ambiguity.

Large investment-grade issuers like Verizon, AT&T, Comcast, and Procter & Gamble often present their debt in aggregate maturity buckets. A 10-K footnote might say "Notes due 2030-2034: $7.7 billion." That's it. No individual breakdowns. This is standard financial reporting practice for companies with dozens of outstanding bond series.

When we asked the model to extract individual instruments from these filings, it tried to help. It decomposed $7.7 billion into several individual bonds, each with a coupon rate and maturity year, summing to approximately the right total. The output looked like real extraction. The formatting was consistent with actual SEC data. But the individual instruments were fabricated. The model had taken an aggregate number and reverse-engineered plausible components.

Charter Communications was where we first noticed this clearly. The extraction produced $84 billion in instruments that were essentially disaggregated maturity buckets. Charter's actual debt structure is well-documented in their indentures, but the 10-K presents it in summary form. The model filled in detail that the source document simply doesn't contain.

What makes this particularly tricky is that the output passes basic sanity checks. The amounts add up. The maturity dates are in range. The coupon rates are plausible. You'd catch it if you noticed none of the fabricated instruments have CUSIPs, or if you compared against the supplemental indentures filed as 8-K exhibits. But at a glance, it looks like clean extraction.

This is fundamentally a problem of the model not knowing what it doesn't know. When a human analyst reads "Notes due 2030-2034: $7.7 billion," they understand that individual breakdowns aren't available in this document. The model sees a gap between what was asked for (individual instruments) and what's available (aggregate totals), and bridges it with plausible generation. It's doing what language models do. It's just not what you want when accuracy matters.

## Observations

A few things we took away from this work.

These errors are all variations of the same underlying behavior: the model generates plausible output that matches the expected format, regardless of whether the source data supports it. Phantom instruments look like real instruments.

The models are remarkably good at the core task. Across hundreds of companies, the majority of extractions are accurate. The error rate is low enough that it would be easy to trust the output wholesale, which is exactly what makes the errors dangerous.

Domain knowledge matters at the extraction layer. Knowing that banks report differently than corporates, that airlines use EETCs, that IG issuers use aggregate footnotes, you can't learn these things from the filing format alone. The extraction system needs to encode domain expertise, not just parsing ability.

Verification has to be independent of extraction. Using the same model to extract and verify tends to reproduce the same errors. Our QA pipeline uses a different model, different prompts, and different comparison logic. The cost is de minimis per company per QA pass. Relative to the cost of serving wrong data, it's trivial.

LLMs are getting better fast, and these error patterns will shrink over time. But for now, if you're building anything where the numbers matter, you should still assume that the average LLM is going to make plenty of mistakes. And it is your duty to fix them.
