/**
 * The Model Context Protocol, the part a stateless server needs: JSON-RPC 2.0
 * over one HTTP POST per message (the Streamable HTTP transport, answering in
 * plain JSON, no server-initiated stream). Pure, so it is tested without a
 * server; the route in src/app/api/mcp supplies the tools.
 */

export const MCP_PROTOCOL = "2025-06-18";
const SUPPORTED = new Set(["2025-06-18", "2025-03-26", "2024-11-05"]);

/** A tool as tools/list shows it. `title` and `annotations` (readOnlyHint and the like) are optional hints for clients. */
export type McpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };
};

export type RpcId = string | number | null;

export type RpcRequest = { jsonrpc?: unknown; id?: RpcId; method?: unknown; params?: unknown };

export type RpcResponse = { jsonrpc: "2.0"; id: RpcId; result?: unknown; error?: { code: number; message: string } };

export type ToolCall = (name: string, args: Record<string, unknown>) => Promise<unknown>;

export type McpIcon = { src: string; mimeType: string; sizes?: string[] };

/** What initialize says about the server. `title`, `websiteUrl` and `icons` are optional, for clients that show them. */
export type McpServer = { name: string; version: string; title?: string; websiteUrl?: string; icons?: McpIcon[]; instructions?: string };

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;

export function rpcError(id: RpcId, code: number, message: string): RpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

export const parseError = () => rpcError(null, PARSE_ERROR, "Parse error");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Answers one message. Returns null for a notification (no id), which gets no reply. */
export async function handleRpc(message: unknown, tools: McpTool[], call: ToolCall, server: McpServer): Promise<RpcResponse | null> {
  if (!isRecord(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return rpcError(isRecord(message) && (typeof message.id === "string" || typeof message.id === "number") ? message.id : null, INVALID_REQUEST, "Invalid request");
  }
  const id: RpcId | undefined = typeof message.id === "string" || typeof message.id === "number" ? message.id : message.id === null ? null : undefined;
  const params = isRecord(message.params) ? message.params : {};
  if (id === undefined) return null; // a notification, e.g. notifications/initialized

  switch (message.method) {
    case "initialize": {
      const asked = typeof params.protocolVersion === "string" ? params.protocolVersion : MCP_PROTOCOL;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: SUPPORTED.has(asked) ? asked : MCP_PROTOCOL,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: server.name, version: server.version, ...(server.title ? { title: server.title } : {}), ...(server.websiteUrl ? { websiteUrl: server.websiteUrl } : {}), ...(server.icons ? { icons: server.icons } : {}) },
          ...(server.instructions ? { instructions: server.instructions } : {}),
        },
      };
    }
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools } };
    case "tools/call": {
      const name = typeof params.name === "string" ? params.name : "";
      if (!tools.some((tool) => tool.name === name)) return rpcError(id, INVALID_PARAMS, `Unknown tool: ${name || "(none)"}`);
      const args = isRecord(params.arguments) ? params.arguments : {};
      try {
        const result = await call(name, args);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }],
            ...(isRecord(result) ? { structuredContent: result } : {}),
          },
        };
      } catch (error) {
        const text = error instanceof Error ? error.message : "The tool failed.";
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError: true } };
      }
    }
    default:
      return rpcError(id, METHOD_NOT_FOUND, `Method not found: ${message.method}`);
  }
}

/** A batch or a single message: the replies in the same shape, or null when nothing needs a reply. */
export async function handleBatch(body: unknown, tools: McpTool[], call: ToolCall, server: McpServer): Promise<RpcResponse | RpcResponse[] | null> {
  if (Array.isArray(body)) {
    if (!body.length) return rpcError(null, INVALID_REQUEST, "Invalid request");
    const replies = (await Promise.all(body.map((item) => handleRpc(item, tools, call, server)))).filter((reply): reply is RpcResponse => reply !== null);
    return replies.length ? replies : null;
  }
  return handleRpc(body, tools, call, server);
}
