---
title: "Introducing Medici"
date: "2026-03-06"
excerpt: "The more time we spent talking to credit professionals, the more we realized that data alone isn't enough. Good data is the foundation, not the finish line. Real credit analysis is a combination of frameworks, intuition, and judgment that takes years to develop. The data is obviously very useful, but unless you know how to leverage it and draw the right conclusions, it has little value."
author: "DebtStack Team"
---

When we started DebtStack, the goal was straightforward. Take credit data that's scattered across SEC filings, bond indentures, and credit agreements, structure it properly, and make it available via API. Let analysts and developers pull what they need and run with it.

But the more time we spent talking to credit professionals, the more we realized that data alone isn't enough. Good data is the foundation, not the finish line. Real credit analysis is a combination of frameworks, intuition, and judgment that takes years to develop. The data is obviously very useful, but unless you know how to leverage it and draw the right conclusions, it has little value.

That's the gap we are trying to fill with Medici.

Medici is an AI credit analyst built on top of DebtStack's data infrastructure. The idea is simple: give it the same data a professional analyst would use, and teach it to think the way a professional analyst would think. 

To build it that way, we had to think carefully about what credit analysis actually is. And when we broke it down, it looked a lot like a career.

## Layer 1: The Intern

Every credit analyst starts in the same place. You pull data, you calculate metrics, you read documents and summarize what they say. You don't yet have strong opinions. You're building familiarity.

This is where Medici started too. It calls the DebtStack API, retrieves structured data across issuers and securities, reads the underlying agreements, and surfaces the numbers that matter. Leverage ratios, coverage metrics, maturity profiles, covenant terms. It can tell you what the capital structure looks like.

That's necessary but not sufficient.

## Layer 2: The Junior Analyst

After a year or two, a good analyst starts developing frameworks. They learn to read beyond the numbers. They understand that two bonds with the same yield can have very different risk profiles depending on where they sit in the capital structure. An 8% unsecured HoldCo note is a fundamentally different bet than an 8% secured OpCo bond, even though the coupon looks identical. One has structural subordination working against it. The other has access to a first lien on highly valued equipment.

That kind of contextual judgment doesn't come from the numbers themselves. It comes from understanding how capital structures work, how creditors get paid in a restructuring, what distress actually looks like before it shows up in the price.

We built a knowledge base for Medici that captures this layer. Credit analysis frameworks, distress indicators, recovery methodology, real case studies. The goal is that when Medici looks at a capital structure, it's not just reading numbers. It's applying the same analytical lens a trained analyst would apply.

We also gave it memory. Unlike an intern who forgets what they did last week, Medici stores its prior work and can draw on it. Every session and every analysis is accessible when it's relevant.

## Layer 3: The Experienced Analyst

This is the layer that's hardest to replicate and most valuable when you get it right.

A technically strong junior analyst and a battle-tested senior analyst can look at the same credit and reach different conclusions. Not because the junior analyst is wrong on the numbers, but because the senior analyst has seen how these situations actually play out. They've watched management teams make promises they couldn't keep. They've seen liquidity crunches that weren't obvious in the financial model. They carry institutional memory, the accumulated lessons of investments that worked and investments that didn't.

The firms that consistently differentiate themselves in credit tend to have this kind of institutional knowledge embedded in their process. It's not written down anywhere. It lives in the people.

Medici's third layer is an attempt to make that institutional knowledge portable. Over time, it builds a shared knowledge base from lessons learned across multiple credits and investments. Every insight gets reviewed by a human before it becomes active in the system. The goal is that every analysis Medici runs is informed not just by frameworks but by experience, including experience from situations it wasn't directly involved in.

## Layer 4: The Macro-Aware Analyst

The best credit analysts don't just understand the company they're analyzing. They understand the world the company operates in.

A leveraged energy producer's ability to service its debt depends on commodity prices. A European HoldCo's refinancing risk is shaped by ECB policy. A consumer-facing credit can look solid on paper and get quietly destroyed by a shift in spending patterns that doesn't show up in last quarter's numbers.

Credit analysis done well means understanding the second-order effects. What does a rising rate environment mean for this specific capital structure? What happens to this business if the commodity cycle turns? These aren't questions you can answer by looking at the balance sheet alone.

That's why we're building Medici to consult with specialized agents when the analysis requires it. Macro. Commodities. Rates. Not because every credit needs that layer, but because a good analyst knows when to reach for it. Medici should too.

## What We're Actually Building

The goal was never to replace credit analysts. Most of the best analysts we've talked to aren't worried about that either. What they're worried about is time. There's never enough of it. Screening a new credit, building out a capital structure, running through the downside scenarios, understanding where you'd recover in a restructuring. That work takes hours, sometimes days, before you've even formed a real view.

Medici is built to compress that timeline. To handle the foundational work so analysts can spend their time on the judgment calls that actually matter.

DebtStack provides the data. Medici provides the analytical layer on top of it. Together they're an attempt to give any credit investor, regardless of team size or resources, access to the kind of analytical depth that used to require years of experience and a room full of people to produce.

We're still early. But this is what we're building toward.

You can try Medici at [debtstack.ai/dashboard/chat](https://debtstack.ai/dashboard/chat).
