// app/api/chat/request-coverage/route.ts
// Proxy to backend for coverage requests — authenticated via Clerk

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.debtstack.ai";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ticker: string; companyName: string; cik?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { ticker, companyName, cik } = body;
  if (!ticker || !companyName) {
    return Response.json(
      { error: "Ticker and company name are required" },
      { status: 400 }
    );
  }

  try {
    const resp = await fetch(`${BACKEND_URL}/v1/coverage/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        company_name: companyName,
        cik: cik || null,
        clerk_user_id: userId,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: resp.statusText }));
      return Response.json(
        { error: err.detail || "Backend request failed" },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return Response.json(data);
  } catch (err) {
    console.error("[request-coverage] Error:", err);
    return Response.json(
      { error: "Failed to submit coverage request" },
      { status: 500 }
    );
  }
}
