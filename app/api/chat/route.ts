// app/api/chat/route.ts
// SSE streaming chat API route with Gemini tool-use loop

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";
import { DEBTSTACK_TOOLS } from "@/lib/chat/tools";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";
import { executeTool } from "@/lib/chat/tool-executor";

export const maxDuration = 60;

const MAX_TOOL_ROUNDS = 5;
const MAX_MESSAGES = 50;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
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
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: DEBTSTACK_TOOLS }],
      });
      let totalCost = 0;

      try {
        // Build Gemini content history
        // Map "assistant" → "model" for Gemini's role convention
        const geminiContents: Content[] = messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        // Tool-use loop
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const result = await model.generateContent({
            contents: geminiContents,
          });

          const response = result.response;
          const parts = response.candidates?.[0]?.content?.parts ?? [];

          // Process parts
          let hasFunctionCall = false;
          const functionResponseParts: Part[] = [];

          for (const part of parts) {
            if (part.text) {
              controller.enqueue(
                encoder.encode(sseEvent("text", { text: part.text }))
              );
            } else if (part.functionCall) {
              hasFunctionCall = true;
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

              // Execute the tool
              const toolResult = await executeTool(toolName, toolArgs, apiKey);
              totalCost += toolResult.cost;

              // Notify client of tool result
              controller.enqueue(
                encoder.encode(
                  sseEvent("tool_result", {
                    id: toolId,
                    name: toolName,
                    cost: toolResult.cost,
                    error: toolResult.error,
                  })
                )
              );

              functionResponseParts.push({
                functionResponse: {
                  name: toolName,
                  response: toolResult.error
                    ? { error: toolResult.error }
                    : (toolResult.data as object),
                },
              });
            }
          }

          if (!hasFunctionCall) {
            // No tool calls — we're done
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
        }

        // Done
        controller.enqueue(
          encoder.encode(sseEvent("done", { totalCost }))
        );
      } catch (err) {
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
