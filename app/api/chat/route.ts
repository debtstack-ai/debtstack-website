// app/api/chat/route.ts
// SSE streaming chat API route with Claude tool-use loop

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: "Chat service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const client = new Anthropic({ apiKey: anthropicKey });
      let totalCost = 0;

      try {
        // Build the Anthropic message history
        const anthropicMessages: Anthropic.MessageParam[] = messages.map(
          (m) => ({
            role: m.role,
            content: m.content,
          })
        );

        // Tool-use loop
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const response = await client.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: DEBTSTACK_TOOLS,
            messages: anthropicMessages,
          });

          // Process content blocks
          let hasToolUse = false;
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          let textContent = "";

          for (const block of response.content) {
            if (block.type === "text") {
              textContent += block.text;
              controller.enqueue(
                encoder.encode(sseEvent("text", { text: block.text }))
              );
            } else if (block.type === "tool_use") {
              hasToolUse = true;
              const toolName = block.name;
              const toolArgs = block.input as Record<string, unknown>;
              const toolId = block.id;

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
              const result = await executeTool(toolName, toolArgs, apiKey);
              totalCost += result.cost;

              // Notify client of tool result
              controller.enqueue(
                encoder.encode(
                  sseEvent("tool_result", {
                    id: toolId,
                    name: toolName,
                    cost: result.cost,
                    error: result.error,
                  })
                )
              );

              toolResults.push({
                type: "tool_result",
                tool_use_id: toolId,
                content: result.error
                  ? `Error: ${result.error}`
                  : JSON.stringify(result.data),
              });
            }
          }

          if (!hasToolUse) {
            // No tool calls — we're done
            break;
          }

          // Feed tool results back into the conversation
          anthropicMessages.push({
            role: "assistant",
            content: response.content,
          });
          anthropicMessages.push({
            role: "user",
            content: toolResults,
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
