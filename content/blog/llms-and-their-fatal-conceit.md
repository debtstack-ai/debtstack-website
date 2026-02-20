---
title: "The Deceptive Confidence of LLMs"
date: "2026-02-19"
excerpt: "LLMs get you 80% of the way and then bluff the rest. In credit markets, the 20% they hallucinate is the 20% that matters most."
author: "DebtStack Team"
---

Ask an LLM about a company's debt structure and you'll get a confident, well-formatted answer. The right types of instruments, approximately correct total debt, plausible seniority labels. At first glance, it looks like the output of a competent credit analyst.

Look closer and the answer starts to come apart. The maturity date belongs to a bond that was refinanced two years ago. The interest rate is from a different tranche. A $2 billion term loan is missing entirely because the model's training data predates the filing where it was disclosed. The covenant ratio it cites has never appeared in any credit agreement the company has signed.

The accurate parts and the fabricated parts are presented identically — same confidence, same formatting, same apparent precision. No caveats. No footnotes saying "I'm not sure about this part." You have no way of telling which is which without going back to the source documents yourself.

## The 80/20 bluff

LLMs reliably get you about 80% of the way to a correct answer on credit data. The company name, the general shape of the capital structure, the broad strokes. Enough to look right. The remaining 20% is where things go quietly, dangerously wrong — and in credit markets, that 20% tends to be exactly the part that matters.

Is the bond callable at par in 2027 or not? Does the leverage covenant step down to 4.5x or 5.0x? Is the debt guaranteed by the operating subsidiaries or just the holding company? These are the questions that determine whether an investment thesis holds, and they're precisely the questions LLMs get wrong most often. A portfolio manager who trusts an LLM-generated credit summary is making decisions based partly on extracted data and partly on plausible fiction, with nothing in the output to distinguish between the two.

We know because we've seen every one of these failures first-hand.

## What we found building DebtStack

We built DebtStack by extracting debt data from SEC filings for 291 public companies, using LLMs extensively in the process — primarily Google's Gemini. Over 11 extraction phases spanning months of work, we catalogued every way these models fail at credit data. The examples below are all real.

**Phantom instruments.** Running extraction on Gilead Sciences produced 13 debt instruments totaling $16.4 billion that simply do not exist. Not misattributed instruments from a different company or filing period — fabricated entirely. Plausible-sounding names, amounts, and maturity dates for bonds that Gilead has never issued. Without a verification step, $16.4 billion in phantom debt would have entered our database as fact.

**Scale errors.** SEC filings state their scale explicitly: "in millions", "in thousands", or "in billions." The declaration appears once, at the top of the financial statements, and applies to every number that follows. When the model misreads this — or ignores it — the error is multiplicative.

Costco's bonds came back 1,000x too small, with the 3.00% Notes 2027 reported at $1 million instead of $1 billion. AbbVie came back 100x too small across 11 separate bonds, dragging reported coverage from 87% down to 41%. Boeing's 3.95% Notes due 2059 came back 1,000x too high. Mastercard's floating rate notes were off by 10x. Scale errors affected dozens of companies across our extraction, and every single one looked perfectly plausible in the output.

**Issuance vs. outstanding confusion.** A bond's supplemental indenture might say "Original principal amount: $3.8 billion" in the header, while the current outstanding balance in the latest 10-K footnote reads $520 million after years of tender offers and repurchases. The model would frequently grab the larger, more prominent number. We saw this pattern produce 68% to 89% debt discrepancies across multiple companies before we caught it. The model was reading the document correctly — just reading the wrong number from it.

**Double-counting from aggregate buckets.** Lowe's extraction returned 9 "instruments" totaling $4.3 billion that turned out to be fiscal-year maturity buckets — "Notes due fiscal 2030-2034" — double-counting the individual bonds already elsewhere in the filing. JPMorgan was worse: the model extracted a "Callable Fixed Rate Notes due 2032" line item at $117.67 billion, which was a sub-category aggregate of senior notes masquerading as an individual instrument. Duke Energy had 17 duplicate entries totaling $12.4 billion in overcounting.

**Intercompany loans treated as external debt.** DISH Network's extraction included a $4.8 billion intercompany loan between DISH and its subsidiaries. Intercompany loans eliminate in consolidation — they represent internal accounting, not debt owed to external creditors. But the model found it in a filing, it looked like debt, so it was reported as debt.

**Capacity vs. drawn confusion.** Atlassian's revolving credit facility was reported at $750 million outstanding. That $750 million is the facility's total capacity. The actual drawn amount was zero. The model read "$750 million revolving credit facility" and treated the commitment as a balance.

**Trade volume confused with principal.** Baker Hughes' 4.08% Notes due 2047 were reported with a principal of $135,000. The actual principal amount is $1.34 billion. The model pulled the last trade volume from a pricing table instead of the outstanding amount from the debt table.

None of these errors announced themselves. Every one arrived in a clean JSON response with proper field names and reasonable-looking numbers. Without systematic verification against the source documents, every one would have been accepted as fact.

## Confidence without calibration

A junior analyst who gets something wrong will usually hedge. "I think the revolver is $1.5 billion, but I need to double-check the amendment." The uncertainty is visible. You know where to direct your follow-up.

LLMs produce no such signal. Gilead's 13 phantom bonds were returned in the same JSON array as the real ones — same field names, same formatting, same apparent precision. Costco's 1,000x scale errors sat alongside correctly scaled figures with equal authority. The model that confused Baker Hughes' trade volume with its principal amount reported both numbers with identical confidence. There was nothing in the output to distinguish verified extraction from fabrication.

We even found cases where the verification itself hallucinated. Our extraction pipeline includes a QA agent — a second LLM call that checks the extraction against the source document. In early iterations, the QA agent developed its own systematic errors: comparing cents to dollars and reporting 99% discrepancies, or reading issuance amounts instead of outstanding balances and flagging 68% discrepancies that didn't exist. The verifier was hallucinating about the very data it was supposed to verify.

This gets at something fundamental about how these models work. An LLM cannot distinguish between what it extracted from a document and what it generated to fill a gap. There is no internal flag that marks one token as "retrieved" and another as "guessed." Every token emerges with the same fluency, the same formatting, the same apparent certainty. For a portfolio manager reading the output, the only way to separate accurate data from fabricated data is to go back to the source filings — which defeats the purpose of using the model in the first place.

## Why credit data is uniquely vulnerable

These failures follow patterns, and credit data has specific properties that make it particularly susceptible to confident hallucination.

**Stale training data.** LLM knowledge cutoffs typically lag current SEC filings by 12 to 18 months. Companies refinance, issue new debt, and amend credit agreements constantly. A model trained on data from mid-2024 will describe a capital structure that may have changed materially since then — a distressed exchange completed, a series of notes retired, a revolver fully drawn — and describe it with complete conviction.

**Dense, context-dependent formatting.** A 10-K debt footnote might list 15 instruments in a table where the column headers are three pages above the data. The scale declaration ("in millions") appears once in the filing header and governs every number that follows. Floating rate loans reference SOFR plus a spread defined in a credit agreement filed as an 8-K exhibit six months earlier. The instrument name "5.25% Senior Notes due 2030" is a compressed encoding of rate type, seniority, and maturity in a single string. LLMs process all of this, but connecting every piece correctly across a 200-page filing requires a kind of sustained, precise attention that probabilistic generation struggles with.

**The same instrument, multiple numbers.** The debt footnote shows the outstanding balance. The maturity schedule groups the same instrument by year. The MD&A discusses it in the context of liquidity. A supplemental indenture lists the original issuance amount. An LLM reading all four sections can easily confuse original issuance with current outstanding, or double-count an instrument that appears in each one. We saw this happen systematically across our entire extraction.

**Data that doesn't exist where models look for it.** Twelve of our target companies — Verizon, AT&T, Procter & Gamble, Coca-Cola among them — present their debt in aggregate maturity buckets in their 10-K footnotes. "Notes due 2030-2034: $7.7 billion." No per-instrument breakdown exists in the filing. We threw the best available models at these filings repeatedly and got the same result every time: Verizon had 60 bonds outstanding and the model extracted one. AT&T, Procter & Gamble, and Coca-Cola: zero. You cannot extract what the source document does not contain, regardless of how capable the model becomes.

**Structural nuance buried in legal language.** Whether a bond is guaranteed by operating subsidiaries or sits alone at the holding company level determines whether the claim is structurally senior or structurally subordinated — a distinction worth billions in a restructuring. This information lives in guarantee language spread across indentures and credit agreements, often hundreds of pages long. An LLM will tell you "the bonds are guaranteed" without specifying which entities are guarantors or what that implies for recovery in a distressed scenario.

## Will this get better?

Model capabilities are improving rapidly. Context windows are growing. Reasoning is becoming more sophisticated. Newer models are measurably better at following complex extraction instructions and maintaining consistency across long documents.

And when the data is in the filing and the filing is cleanly formatted, LLMs already work well. We extracted Prologis at 59 out of 59 instruments. United Airlines: 6 for 6. Chubb: 31 for 31. T-Mobile: 15 for 15. When per-instrument data exists in a clean debt footnote table, current models extract at 90-100% accuracy.

The deeper issue is architectural. LLMs are probabilistic text generators. They produce plausible continuations of text based on patterns in their training data. When the training data contains the answer, the continuation is accurate. When it doesn't, the continuation is still plausible — because plausibility is the objective function, not accuracy. There is no internal mechanism that distinguishes "I retrieved this" from "I generated this," and until that changes, the confidence problem persists.

Retrieval-augmented generation closes some of the gap. Giving a model the actual SEC filing and asking it to extract specific data produces much better results than relying on parametric knowledge alone. But RAG introduces its own failure modes. The retrieval step has to locate the right document and the right section within it. We discovered that 40% of our stored debt footnote sections contained entire 10-Q filings truncated at 100,000 characters instead of just the debt note, because three bugs in our section-finding regex meant the patterns couldn't match common heading formats. Even after retrieval, the model has to handle HTML, XBRL, inconsistent formatting, tables that span multiple pages, and the full complexity of scale interpretation, instrument name mapping, and current-vs.-historical disambiguation. Each of these steps can fail silently.

After 11 extraction phases, roughly $15 to $20 in API costs, and months of pipeline development, we reached a ceiling: 68.5% of $6.6 trillion in total debt across 211 companies extracted correctly. Further LLM extraction against existing SEC filings yielded less than a 5% hit rate on the remaining gaps. Those gaps were structural — aggregate-only footnotes, bank deposits classified as debt, utility subsidiary-level issuance — and no improvement in model capability would close them.

## Structured data as the answer

Consider what happens when an AI agent needs to answer "What is Oracle's leverage ratio?" The agent could read Oracle's 10-K, find the debt footnote, extract every instrument, sum them, find the EBITDA figure, and calculate the ratio on the fly. Or it could query a database where Oracle's leverage ratio has already been computed, cross-referenced against the source filing, and quality-checked — and get an answer back in milliseconds.

DebtStack takes the second approach. Every debt instrument is individually extracted, verified against the source filing, and checked through a multi-step pipeline before it enters the database. When you query the API, you're getting data that has survived systematic verification, not a single-pass LLM generation that might be right.

The LLM still plays a critical role as the interface layer — understanding natural language questions, selecting the right API calls, formatting and presenting results. But the underlying credit data comes from a structured, verified source. The model accesses the data and presents it; it doesn't generate it from memory or extract it on the fly.

This separation gives you both things at once: the flexibility of natural language interaction and the accuracy that credit professionals require. A model can hallucinate its way through a casual conversation without consequences. When real money is at stake — when a single misunderstood covenant or misattributed guarantee can change an investment thesis — the data has to be right, and "probably right" doesn't cut it.

## The bottom line

LLMs have made it possible to interact with complex financial data in ways that would have seemed impossible five years ago. They are genuinely transformative tools. But their confidence bears no reliable relationship to their accuracy. They present everything with equal conviction — the data they extracted from a document and the data they fabricated to fill a gap — and nothing in the output tells you which is which.

In credit markets, that gap between confidence and accuracy is a material risk. The solution is to keep using LLMs where they excel — as an intelligent interface to structured data — while making sure the data itself has been extracted, verified, and quality-checked by a system designed to catch the hallucinations before they reach you.

That's what we built DebtStack to do.
