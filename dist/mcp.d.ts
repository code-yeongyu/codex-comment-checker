import { type CommentCheckerRunner } from "./runner.js";
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
type JsonRpcRequest = {
    jsonrpc: "2.0";
    id?: string | number | null;
    method: string;
    params?: unknown;
};
type JsonRpcResponse = {
    jsonrpc: "2.0";
    id: string | number | null;
    result: JsonValue;
} | {
    jsonrpc: "2.0";
    id: string | number | null;
    error: {
        code: number;
        message: string;
    };
};
export type McpHandlerOptions = {
    run?: CommentCheckerRunner;
    version?: string;
};
export declare function createCommentCheckerMcpHandler(options?: McpHandlerOptions): (request: JsonRpcRequest) => Promise<JsonRpcResponse | undefined>;
export declare function runMcpStdioServer(): Promise<void>;
export {};
//# sourceMappingURL=mcp.d.ts.map