// app/api/chat/route.ts
// SSE streaming chat API route with Gemini tool-use loop

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  GoogleGenerativeAI,
  type Content,
  type Part,
} from "@google/generative-ai";
import { DEBTSTACK_TOOLS } from "@/lib/chat/tools";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import { executeTool, INFERENCE_COST_PER_TURN } from "@/lib/chat/tool-executor";
import { getRelevantKnowledge } from "@/lib/chat/knowledge";

export const maxDuration = 120;

const MAX_TOOL_ROUNDS = 5;
const MAX_MESSAGES = 50;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GEMINI_TIMEOUT_MS = 45_000;
const MAX_TOOL_RESULT_CHARS = 8_000;

/**
 * Truncate a tool result's JSON representation so it doesn't blow up
 * Gemini's context window on synthesis rounds. Keeps the structure but
 * trims arrays and drops verbose nested objects.
 */
function truncateForGemini(result: object): object {
  const json = JSON.stringify(result);
  if (json.length <= MAX_TOOL_RESULT_CHARS) return result;

  // Deep-trim: walk the object and shorten arrays / drop heavy leaves
  function trim(val: unknown, depth: number): unknown {
    if (val === null || val === undefined) return val;
    if (typeof val !== "object") {
      // Truncate long strings (e.g. document snippets)
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
    // Plain object — drop deeply nested keys beyond depth 4
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

  // If still too large after structural trim, hard-cut the JSON
  if (trimmedJson.length > MAX_TOOL_RESULT_CHARS) {
    return JSON.parse(trimmedJson.slice(0, MAX_TOOL_RESULT_CHARS - 50) + ',"_truncated":"result too large"}');
  }
  return trimmed;
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

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return new Response(
      JSON.stringify({ error: "Chat service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const genAI = new GoogleGenerativeAI(geminiKey);

      // Retrieve relevant knowledge chunks for the latest user message
      const latestUserMessage = messages[messages.length - 1]?.content ?? "";
      const knowledgeContext = await getRelevantKnowledge(latestUserMessage, geminiKey);
      const augmentedPrompt = knowledgeContext
        ? `${SYSTEM_PROMPT}\n\n## Credit Analysis Frameworks\n\nUse the following to guide your analysis. Apply the concepts and reasoning — but do NOT name the frameworks or label your steps (e.g., don't say "Applying the Four Triggers framework"). Just analyze directly. Mention real-world case parallels naturally when relevant.\n\n${knowledgeContext}`
        : SYSTEM_PROMPT;
      console.log(`[chat] Knowledge retrieval: ${knowledgeContext ? `${knowledgeContext.length} chars injected` : 'no matches'}`);

      // Primary model with DebtStack function tools
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: augmentedPrompt,
        tools: [{ functionDeclarations: DEBTSTACK_TOOLS }],
      });

      // Fallback model with Google Search grounding (can't combine with function calling)
      const searchModel = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: augmentedPrompt,
        tools: [{ googleSearch: {} } as never],
      });

      let totalCost = INFERENCE_COST_PER_TURN;

      try {
        // Build Gemini content history
        // Map "assistant" → "model" for Gemini's role convention
        const geminiContents: Content[] = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        // Track whether all tool results returned empty data
        let allToolResultsEmpty = true;
        let hadToolCalls = false;
        // Buffer the final text so we can discard it if falling back to web search
        let bufferedText = "";
        // Deduplicate tool calls — prevent Gemini from calling the same tool with same args
        const toolCallCache = new Map<string, object>();

        // Tool-use loop
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          console.log(`[chat] Gemini round ${round + 1} starting, ${geminiContents.length} messages in context`);
          const result = await withTimeout(
            model.generateContent({ contents: geminiContents }),
            GEMINI_TIMEOUT_MS,
            `Gemini generateContent (round ${round + 1})`
          );

          const response = result.response;
          const candidate = response.candidates?.[0];
          const parts = candidate?.content?.parts ?? [];
          const finishReason = candidate?.finishReason;
          console.log(`[chat] Gemini round ${round + 1} done: ${parts.length} parts, finishReason=${finishReason}`);

          // Process parts
          let hasFunctionCall = false;
          const functionResponseParts: Part[] = [];

          for (const part of parts) {
            if (part.functionCall) {
              hasFunctionCall = true;
              hadToolCalls = true;
              const toolName = part.functionCall.name;
              const toolArgs = (part.functionCall.args ?? {}) as Record<string, unknown>;
              // Gemini doesn't provide tool call IDs; generate one
              const toolId = `call_${round}_${toolName}_${Date.now()}`;

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

              // Check if this tool returned actual data
              if (toolResult.error) {
                // Tool errors (timeouts, auth failures) are not the same as empty data —
                // don't fall back to web search for API errors
                allToolResultsEmpty = false;
              } else {
                const data = toolResult.data as Record<string, unknown> | null;
                if (data) {
                  if (Array.isArray(data.data)) {
                    // Standard DebtStack response: data.data is an array of items
                    if (data.data.length > 0) {
                      allToolResultsEmpty = false;
                    }
                  } else if (data.data !== null && data.data !== undefined) {
                    // Non-array data (e.g., research_company returns an object)
                    allToolResultsEmpty = false;
                  }
                }
              }

              // Notify client of tool result
              const resultMeta: Record<string, unknown> = {
                id: toolId,
                name: toolName,
                cost: toolResult.cost,
                error: toolResult.error,
              };
              // Include item count for debugging
              if (!toolResult.error && toolResult.data) {
                const d = toolResult.data as Record<string, unknown>;
                if (Array.isArray(d.data)) {
                  resultMeta.itemCount = d.data.length;
                }
              }
              controller.enqueue(
                encoder.encode(sseEvent("tool_result", resultMeta))
              );

              const rawResponse = toolResult.error
                ? { error: toolResult.error }
                : (toolResult.data as object);
              functionResponseParts.push({
                functionResponse: {
                  name: toolName,
                  response: truncateForGemini(rawResponse),
                },
              });
            } else if (part.text) {
              // Buffer text — we'll emit it after deciding whether to fall back
              bufferedText += part.text;
            }
          }

          if (!hasFunctionCall) {
            // No tool calls — we're done with the primary loop
            break;
          }

          // Feed tool results back into the conversation
          // First, add the model's response (with function calls)
          geminiContents.push({
            role: "model",
            parts,
          });
          // Then add function responses with role "function"
          geminiContents.push({
            role: "function",
            parts: functionResponseParts,
          });

          // Emit any intermediate text (between tool-use rounds)
          if (bufferedText) {
            controller.enqueue(
              encoder.encode(sseEvent("text", { text: bufferedText }))
            );
            bufferedText = "";
          }
        }

        // Fallback: if DebtStack tools returned no data, use Google Search instead
        if (hadToolCalls && allToolResultsEmpty) {
          // Discard the primary model's "no data" text — replace with search results
          bufferedText = "";

          const searchContents: Content[] = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const searchId = `call_search_web_search_${Date.now()}`;
          controller.enqueue(
            encoder.encode(
              sseEvent("tool_call", {
                id: searchId,
                name: "web_search",
                args: {},
              })
            )
          );

          const searchResult = await withTimeout(
            searchModel.generateContent({ contents: searchContents }),
            GEMINI_TIMEOUT_MS,
            "Gemini web search fallback"
          );

          const searchResponse = searchResult.response;
          const searchParts =
            searchResponse.candidates?.[0]?.content?.parts ?? [];

          // Emit cost for web search
          const groundingMetadata =
            searchResponse.candidates?.[0]?.groundingMetadata;
          const searchCost =
            groundingMetadata?.webSearchQueries &&
            groundingMetadata.webSearchQueries.length > 0
              ? 0.03
              : 0;
          totalCost += searchCost;

          controller.enqueue(
            encoder.encode(
              sseEvent("tool_result", {
                id: searchId,
                name: "web_search",
                cost: searchCost,
              })
            )
          );

          for (const part of searchParts) {
            if (part.text) {
              controller.enqueue(
                encoder.encode(sseEvent("text", { text: part.text }))
              );
            }
          }
        } else if (bufferedText) {
          // No fallback needed — emit the buffered text from primary model
          controller.enqueue(
            encoder.encode(sseEvent("text", { text: bufferedText }))
          );
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
