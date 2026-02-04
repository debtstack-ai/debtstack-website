---
title: "Why We Are Building DebtStack"
date: "2026-01-15"
excerpt: "The credit market is $346 trillion, more than twice the size of equity markets. Yet the data infrastructure around it is decades behind. Here's why we're changing that."
author: "DebtStack Team"
---

The global credit market stands at $346 trillion today. That's more than twice the size of global equity markets. And yet the data infrastructure for credit markets looks nothing like what exists for stocks. The biggest financial market in the world is a black box to a lot of investors.

Equity data, on the other hand, is ubiquitous and in your face. If you want to know Apple's stock price, you google it. Revenue, earnings, p/e ratios and even analyst projections, all free, all instant. Anyone with a laptop and an internet connection can screen stocks, compare fundamentals, and make informed decisions.

Now try doing the same thing with credit - bonds, loans, and debt of all kinds.

Try finding out which of Oracle's bonds offers the highest yields today. Try finding out whether those bonds are issued directly by Oracle or one of its subsidiaries. Try finding out what covenants restrict Oracle's ability to pay dividends and whether those covenants are too restrictive compared to Oracle's peers. Try finding out how each Oracle bond's yield per turn of leverage compares to Coreweave's or Microsoft's. 

Before we launched Debtstack, all of these questions could only be answered with a Bloomberg terminal that costs in excess of $25,000 a year, a team of analysts, or weeks spent reading through SEC filings.

## AI still needs good data

AI's rapid profileration has created an expectation that it can just about answer any question, including questions about complicated company debt structures. In fact, if you ask ChatGPT about a company's debt structure, it will confidently give you an answer. The problem is, as credit professionals will tell you, that answer is probably wrong.

We tested this. We asked leading LLMs, including Claude, straightforward credit questions, leverage ratios, and questions about guarantees and covenant restrictions. The results were bad. LLM knowledge cutoffs lag current SEC filings by 12 to 18 months. They hallucinate bonds that don't exist and covenants that were never written. The only way to get some degree of accuracy is to upload the source document and provide tailored instructions with plenty of context and guardrails. But then running LLM queries against raw filings costs $0.30 to $0.50 per company per question, and each query takes 90 to 300 seconds.

So the promise of AI democratizing all financial data runs into a basic reality: garbage in, garbage out. LLMs can't give you accurate credit data if that data isn't quality checked, structured and easily accessible.

## What we're building

DebtStack extracts, normalizes, and serves credit data through API that is easily accessible. We leverage our expertise in the credit markets, parsing every relevant source document, understanding indentures and credit agreements, mapping guarantee chains and corporate hierarchies, accurately calculating leverage ratios from audited financials, and tracking real-time bond pricing from FINRA TRACE with spread-to-treasury calculations. Then we run quality checks against to make sure it's right.

And then we serve it all instantly to our users when they need it.

What does that actually let you do?

You can screen the entire credit universe in seconds. Which telecom companies have leverage above 5x and near-term maturities? Filter through thousands of companies by leverage, coverage ratios, maturity profile, or structural risk. 

You can understand structural subordination. Does a bond sit at the holdco or opco level? Who guarantees it? Guarantee chains, subsidiary hierarchies, issuer positions in the corporate structure, all mapped and queryable. Know whether you're structurally senior or junior before you invest tens of thousands of dollars in a bond. This data is extremely relevant but it exists nowhere else in machine-readable form.

You can compare covenant packages across issuers. How do Charter's leverage covenants compare to Altice's? You can understand which issuers and credit agreements have change of control triggers. All of this information is extracted and normalized so you can compare apples to apples across different credit agreements.

And you can do all of it at the speed markets demand. AI agents chain multiple calls together. If each one took 30 seconds, a portfolio analysis would take hours. DebtStack returns in milliseconds.

## Who this is for

If you're building AI agents for finance, your tools are only as good as your data. LLM hallucinations aren't acceptable when real money is on the line.

If you're an individual investor researching credit opportunities, you shouldn't need a $25,000 terminal to access the same information that institutions take for granted.

If you're a fintech startup building credit products, you shouldn't have to spend months building data infrastructure before you can build your actual product.

If you're a quant researcher, you need structured credit data that's accurate, complete, and programmatically accessible, not PDFs and web scraping.

## Where this goes

We're working toward a future where every investor, big or small can get answers as sophisticated as anything a bank's credit desk would produce, complete with structural subordination analysis, relative value comparison, and covenant review.

A future where credit markets are as transparent and accessible as equity markets. Where the information gap between Wall Street and everyone else gets smaller. Where AI agents can do real credit analysis, evaluating recovery prospects, comparing covenant packages, identifying relative value, instead of just summarizing whatever they find on the web.

## Transparency changes markets

Here's something we know to be true: when you make market data accessible, markets get better.

This isn't theory. When FINRA introduced post-trade transparency to corporate bonds through TRACE, transaction costs fell. Spreads tightened. Investors could negotiate better prices simply because they could see what bonds were actually trading at. A peer-reviewed study in the Review of Financial Studies confirmed that transparency directly reduced the cost of trading corporate bonds.

Equity markets didn't become the most liquid in the world by accident. They became liquid because data became accessible. More participants could analyze the market, pricing became more efficient, spreads tightened, and capital flowed in.

Credit markets are overdue for this same transformation.

That's why we are building DebtStack.

Institutional-grade credit data, for everyone.
