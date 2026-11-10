import { describe, expect, it } from "vitest";
import { handleBatch, handleRpc, MCP_PROTOCOL, type McpTool } from "./mcp-core";

const TOOLS: McpTool[] = [{ name: "echo", description: "Says it back", inputSchema: { type: "object", properties: { text: { type: "string" } } } }];
const SERVER = { name: "ByeFine", version: "1", instructions: "Start with echo." };
const call = async (name: string, args: Record<string, unknown>) => {
  if (name === "echo") {
    if (typeof args.text !== "string") throw new Error("text is required.");
    return { said: args.text };
  }
  throw new Error("nope");
};

describe("the MCP server core", () => {
  it("answers initialize with what it supports", async () => {
    const reply = await handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {} } }, TOOLS, call, SERVER);
    expect(reply).toMatchObject({ jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-03-26", serverInfo: { name: "ByeFine" }, instructions: "Start with echo." } });
    const newer = await handleRpc({ jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "2099-01-01" } }, TOOLS, call, SERVER);
    expect((newer?.result as { protocolVersion: string }).protocolVersion).toBe(MCP_PROTOCOL);
  });

  it("gives notifications no reply", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }, TOOLS, call, SERVER)).toBeNull();
    expect(await handleBatch([{ jsonrpc: "2.0", method: "notifications/initialized" }], TOOLS, call, SERVER)).toBeNull();
  });

  it("lists and calls tools, and reports a tool's failure without failing the call", async () => {
    expect(await handleRpc({ jsonrpc: "2.0", id: "a", method: "tools/list" }, TOOLS, call, SERVER)).toEqual({ jsonrpc: "2.0", id: "a", result: { tools: TOOLS } });
    const ok = await handleRpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "echo", arguments: { text: "hi" } } }, TOOLS, call, SERVER);
    expect(ok?.result).toEqual({ content: [{ type: "text", text: JSON.stringify({ said: "hi" }, null, 2) }], structuredContent: { said: "hi" } });
    const failed = await handleRpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "echo", arguments: {} } }, TOOLS, call, SERVER);
    expect(failed?.result).toEqual({ content: [{ type: "text", text: "text is required." }], isError: true });
    const unknown = await handleRpc({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "nope" } }, TOOLS, call, SERVER);
    expect(unknown?.error?.code).toBe(-32602);
  });

  it("rejects what is not JSON-RPC, and unknown methods", async () => {
    expect((await handleRpc("hello", TOOLS, call, SERVER))?.error?.code).toBe(-32600);
    expect((await handleRpc({ jsonrpc: "1.0", id: 1, method: "ping" }, TOOLS, call, SERVER))?.error?.code).toBe(-32600);
    expect((await handleRpc({ jsonrpc: "2.0", id: 1, method: "resources/list" }, TOOLS, call, SERVER))?.error?.code).toBe(-32601);
    expect(await handleRpc({ jsonrpc: "2.0", id: 9, method: "ping" }, TOOLS, call, SERVER)).toEqual({ jsonrpc: "2.0", id: 9, result: {} });
  });

  it("answers a batch in kind", async () => {
    const replies = await handleBatch(
      [
        { jsonrpc: "2.0", id: 1, method: "ping" },
        { jsonrpc: "2.0", method: "notifications/initialized" },
        { jsonrpc: "2.0", id: 2, method: "tools/list" },
      ],
      TOOLS,
      call,
      SERVER,
    );
    expect(Array.isArray(replies) && replies.map((reply) => reply.id)).toEqual([1, 2]);
    expect((await handleBatch([], TOOLS, call, SERVER)) as { error?: { code: number } }).toMatchObject({ error: { code: -32600 } });
  });
});
