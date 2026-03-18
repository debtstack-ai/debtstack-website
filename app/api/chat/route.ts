// app/api/chat/route.ts
// SSE streaming chat API route with Claude tool-use loop

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DEBTSTACK_TOOLS } from "@/lib/chat/tools";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import { executeTool, INFERENCE_COST_PER_TURN } from "@/lib/chat/tool-executor";
import { getRelevantKnowledge } from "@/lib/chat/knowledge";

export const maxDuration = 120;

const MAX_TOOL_ROUNDS = 5;
const MAX_MESSAGES = 50;
const MODEL_SONNET = "claude-sonnet-4-6";
const MODEL_HAIKU = "claude-haiku-4-5-20251001";
const CLAUDE_TIMEOUT_MS = 45_000;
const MAX_TOOL_RESULT_CHARS = 8_000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Detect whether a user message is a simple lookup (Haiku) or analysis (Sonnet).
 * Simple lookups: single-entity data retrieval, no interpretation needed.
 * Analysis: multi-tool workflows, comparisons, recommendations, valuations.
 */
function isSimpleLookup(message: string): boolean {
  const lower = message.toLowerCase().trim();

  // Analysis triggers → Sonnet
  const analysisPatterns = [
    /\banalyz/,                    // analyze, analysis
    /\bcompare\b/,                 // compare companies/bonds
    /\bvalu(e|ation)/,             // value, valuation
    /\bwhat.s .+ worth/,           // "what's X worth"
    /\bfair value\b/,
    /\bovervalued|undervalued/,
    /\bdistress/,                  // distress assessment
    /\bdefault risk/,
    /\bbankrupt/,
    /\brecovery\b/,                // recovery analysis
    /\bfulcrum\b/,
    /\bwaterfall\b/,
    /\brelative value\b/,
    /\bbest.*(bond|investment)/,   // "best bond to buy"
    /\bwhich.*(bond|should)/,      // "which bond should I"
    /\bcheap.*(vs|or|versus)/,
    /\brisk.reward/,
    /\bcovenant.*(headroom|analysis|breach)/,
    /\bliquidity.*(position|check|runway)/,
    /\bmaturity wall\b/,
    /\bcapital structure\b/,
    /\bdebt stack\b/,
    /\bholdco.*(vs|versus).*opco/,
    /\bstructural subordination/,
    /\bcredit (risk|profile|quality|snapshot)/,
    /\bhow is .+ doing/,           // "how is AAL doing?"
    /\bin trouble\b/,
    /\bshould i (invest|buy)/,
    /\brecommend/,
    /\brank\b/,
    /\bscreen\b.*\b(by|for)\b/,   // "screen for high yield"
  ];

  for (const pattern of analysisPatterns) {
    if (pattern.test(lower)) return false;
  }

  // Simple lookup patterns → Haiku
  const lookupPatterns = [
    /^(show|list|get|what|tell)\b.*\b(bonds?|debt|leverage|rating|spread|price|coupon|maturity|financials)\b/,
    /^what.s .+'s (leverage|rating|spread|debt|bonds)/,
    /\blook up\b/,
    /\bcusip\b/,
    /\bisin\b/,
  ];

  for (const pattern of lookupPatterns) {
    if (pattern.test(lower)) return true;
  }

  // Short messages without analysis keywords are likely simple
  if (lower.split(/\s+/).length <= 8) return true;

  // Default to Sonnet for anything ambiguous
  return false;
}

/**
 * Truncate a tool result's JSON representation to keep context manageable.
 * Keeps the structure but trims arrays and drops verbose nested objects.
 */
function truncateToolResult(result: object): string {
  const json = JSON.stringify(result);
  if (json.length <= MAX_TOOL_RESULT_CHARS) return json;

  function trim(val: unknown, depth: number): unknown {
    if (val === null || val === undefined) return val;
    if (typeof val !== "object") {
      if (typeof val === "string" && (val as string).length > 500) {
        return (val as string).slice(0, 500) + "…";
      }
      return val;
    }
    if (Array.isArray(val)) {
      const maxItems = depth <= 1 ? 10 : 5;
      const sliced = val.slice(0, maxItems);
      const trimmed = sliced.map((v) => trim(v, depth + 1));
      if (val.length > maxItems) {
        return [...trimmed, `(${val.length - maxItems} more items omitted)`];
      }
      return trimmed;
    }
    if (depth > 4) return "(nested data omitted)";
    const obj = val as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = trim(v, depth + 1);
    }
    return out;
  }

  const trimmed = trim(result, 0) as object;
  const trimmedJson = JSON.stringify(trimmed);

  if (trimmedJson.length > MAX_TOOL_RESULT_CHARS) {
    return trimmedJson.slice(0, MAX_TOOL_RESULT_CHARS - 50) + ',"_truncated":"result too large"}';
  }
  return trimmedJson;
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { messages: ChatMessage[]; apiKey: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, apiKey } = body;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({
        error: `Too many messages (max ${MAX_MESSAGES}). Please start a new chat.`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: "Chat service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Gemini key still needed for RAG embeddings
  const geminiKey = process.env.GEMINI_API_KEY;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const client = new Anthropic({ apiKey: anthropicKey });

      // Retrieve relevant knowledge chunks for the latest user message
      const latestUserMessage = messages[messages.length - 1]?.content ?? "";
      let knowledgeContext: string | null = null;
      if (geminiKey) {
        knowledgeContext = await getRelevantKnowledge(latestUserMessage, geminiKey);
      }
      const augmentedPrompt = knowledgeContext
        ? `${SYSTEM_PROMPT}\n\n## Credit Analysis Frameworks\n\nUse the following to guide your analysis. Apply the concepts and reasoning — but do NOT name the frameworks or label your steps (e.g., don't say "Applying the Four Triggers framework"). Just analyze directly. Mention real-world case parallels naturally when relevant.\n\n${knowledgeContext}`
        : SYSTEM_PROMPT;
      console.log(`[chat] Knowledge retrieval: ${knowledgeContext ? `${knowledgeContext.length} chars injected` : 'no matches'}`);

      // Route simple lookups to Haiku, analysis to Sonnet
      const simple = isSimpleLookup(latestUserMessage);
      const model = simple ? MODEL_HAIKU : MODEL_SONNET;
      console.log(`[chat] Model: ${model} (${simple ? 'simple lookup' : 'analysis'})`);

      let totalCost = INFERENCE_COST_PER_TURN;

      try {
        // Build Claude message history
        const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Deduplicate tool calls
        const toolCallCache = new Map<string, object>();

        // Tool-use loop
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          console.log(`[chat] Claude round ${round + 1} starting, ${claudeMessages.length} messages in context`);

          const response = await withTimeout(
            client.messages.create({
              model,
              max_tokens: 4096,
              system: [{ type: "text", text: augmentedPrompt, cache_control: { type: "ephemeral" } }],
              tools: DEBTSTACK_TOOLS,
              messages: claudeMessages,
            }),
            CLAUDE_TIMEOUT_MS,
            `Claude messages.create (round ${round + 1})`
          );

          console.log(`[chat] Claude round ${round + 1} done: ${response.content.length} blocks, stop_reason=${response.stop_reason}`);

          // Collect text and tool_use blocks from response
          let responseText = "";
          const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

          for (const block of response.content) {
            if (block.type === "text") {
              responseText += block.text;
            } else if (block.type === "tool_use") {
              toolUseBlocks.push(block);
            }
          }

          // Emit any text before tool calls
          if (responseText && toolUseBlocks.length > 0) {
            controller.enqueue(
              encoder.encode(sseEvent("text", { text: responseText }))
            );
          }

          // If no tool calls, we're done
          if (toolUseBlocks.length === 0) {
            if (responseText) {
              controller.enqueue(
                encoder.encode(sseEvent("text", { text: responseText }))
              );
            }
            break;
          }

          // Process tool calls
          const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

          for (const toolUse of toolUseBlocks) {
            const toolName = toolUse.name;
            const toolArgs = (toolUse.input ?? {}) as Record<string, unknown>;
            const toolId = toolUse.id;

            // Notify client of tool call
            controller.enqueue(
              encoder.encode(
                sseEvent("tool_call", {
                  id: toolId,
                  name: toolName,
                  args: toolArgs,
                })
              )
            );

            // Execute the tool (with deduplication)
            const cacheKey = `${toolName}:${JSON.stringify(toolArgs)}`;
            const cached = toolCallCache.get(cacheKey);
            let toolResult: import("@/lib/chat/tool-executor").ToolResult;

            if (cached) {
              console.log(`[chat] Tool call DEDUPLICATED: ${toolName}`, JSON.stringify(toolArgs));
              toolResult = { data: cached, cost: 0 };
            } else {
              console.log(`[chat] Tool call: ${toolName}`, JSON.stringify(toolArgs));
              toolResult = await executeTool(toolName, toolArgs, apiKey);
              if (toolResult.error) {
                console.error(`[chat] Tool error: ${toolName}:`, toolResult.error);
              } else {
                const dataObj = toolResult.data as Record<string, unknown> | null;
                const count = dataObj && Array.isArray(dataObj.data) ? dataObj.data.length : 'n/a';
                console.log(`[chat] Tool result: ${toolName} returned ${count} items`);
                if (toolResult.data) {
                  toolCallCache.set(cacheKey, toolResult.data as object);
                }
              }
            }
            totalCost += toolResult.cost;

            // Notify client of tool result
            const resultMeta: Record<string, unknown> = {
              id: toolId,
              name: toolName,
              cost: toolResult.cost,
              error: toolResult.error,
            };
            if (!toolResult.error && toolResult.data) {
              const d = toolResult.data as Record<string, unknown>;
              if (Array.isArray(d.data)) {
                resultMeta.itemCount = d.data.length;
              }
            }
            controller.enqueue(
              encoder.encode(sseEvent("tool_result", resultMeta))
            );

            // Build tool_result block for Claude
            const resultContent = toolResult.error
              ? toolResult.error
              : truncateToolResult(toolResult.data as object);

            toolResultBlocks.push({
              type: "tool_result",
              tool_use_id: toolId,
              content: resultContent,
            });
          }

          // Add assistant response + tool results to conversation for next round
          claudeMessages.push({
            role: "assistant",
            content: response.content,
          });
          claudeMessages.push({
            role: "user",
            content: toolResultBlocks,
          });
        }

        // Done
        controller.enqueue(
          encoder.encode(sseEvent("done", { totalCost }))
        );
      } catch (err) {
        console.error("[chat] Stream error:", err);
        const message =
          err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(sseEvent("error", { message }))
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
