import { stdin as processStdin, stdout as processStdout } from "node:process";
import { createInterface } from "node:readline";
import { isRecord, toHookInput } from "./core.js";
import { runCommentChecker } from "./runner.js";
const SERVER_NAME = "codex-comment-checker";
const DEFAULT_VERSION = "0.1.0";
export function createCommentCheckerMcpHandler(options = {}) {
    const runner = options.run ?? runCommentChecker;
    const version = options.version ?? DEFAULT_VERSION;
    return async (request) => {
        if (request.method === "notifications/initialized")
            return undefined;
        const id = request.id ?? null;
        try {
            if (request.method === "initialize") {
                return success(id, {
                    capabilities: {
                        tools: {
                            listChanged: false,
                        },
                    },
                    serverInfo: {
                        name: SERVER_NAME,
                        version,
                    },
                    protocolVersion: protocolVersion(request.params),
                });
            }
            if (request.method === "tools/list") {
                return success(id, {
                    tools: [commentCheckToolDefinition()],
                });
            }
            if (request.method === "tools/call") {
                return success(id, await callTool(request.params, runner));
            }
            if (request.method === "ping") {
                return success(id, {});
            }
            return failure(id, -32601, `Unknown method: ${request.method}`);
        }
        catch (error) {
            return failure(id, -32603, error instanceof Error ? error.message : String(error));
        }
    };
}
export async function runMcpStdioServer() {
    const handle = createCommentCheckerMcpHandler();
    const lines = createInterface({
        input: processStdin,
        crlfDelay: Number.POSITIVE_INFINITY,
    });
    for await (const line of lines) {
        if (line.trim().length === 0)
            continue;
        const parsed = JSON.parse(line);
        if (!isJsonRpcRequest(parsed))
            continue;
        const response = await handle(parsed);
        if (response) {
            processStdout.write(JSON.stringify(response));
            processStdout.write("\n");
        }
    }
}
async function callTool(params, runner) {
    if (!isRecord(params) || params.name !== "comment_check" || !isRecord(params.arguments)) {
        throw new Error("tools/call requires name 'comment_check' and object arguments");
    }
    const argumentsObject = params.arguments;
    const cwd = getString(argumentsObject, "cwd") ?? process.cwd();
    const filePath = getString(argumentsObject, "filePath") ?? getString(argumentsObject, "file_path");
    if (!filePath) {
        throw new Error("comment_check requires filePath");
    }
    const toolInput = commentCheckToolInput(filePath, argumentsObject);
    const result = await runner(toHookInput({
        sourceToolName: "comment_check",
        toolName: toolNameForInput(toolInput),
        filePath,
        toolInput,
    }, { sessionId: "mcp", cwd }));
    if (result.status === "pass") {
        return textResult("No comment issues found", false);
    }
    if (result.status === "warning") {
        return textResult(result.message || "comment-checker reported a warning", false);
    }
    return textResult(result.message || "comment-checker failed", true);
}
function commentCheckToolInput(filePath, argumentsObject) {
    const content = getString(argumentsObject, "content");
    if (content !== undefined) {
        return {
            file_path: filePath,
            content,
        };
    }
    const edits = getMcpEdits(argumentsObject.edits);
    if (edits.length > 0) {
        return {
            file_path: filePath,
            edits,
        };
    }
    const oldString = getString(argumentsObject, "oldString") ?? getString(argumentsObject, "old_string") ?? "";
    const newString = getString(argumentsObject, "newString") ?? getString(argumentsObject, "new_string");
    if (newString === undefined) {
        throw new Error("comment_check requires content, edits, or newString");
    }
    return {
        file_path: filePath,
        old_string: oldString,
        new_string: newString,
    };
}
function toolNameForInput(toolInput) {
    if (toolInput.content !== undefined)
        return "Write";
    if (toolInput.edits !== undefined)
        return "MultiEdit";
    return "Edit";
}
function getMcpEdits(value) {
    if (!Array.isArray(value))
        return [];
    const edits = [];
    for (const item of value) {
        if (!isRecord(item))
            continue;
        const oldString = getString(item, "oldString") ?? getString(item, "old_string");
        const newString = getString(item, "newString") ?? getString(item, "new_string");
        if (oldString === undefined || newString === undefined)
            continue;
        edits.push({ old_string: oldString, new_string: newString });
    }
    return edits;
}
function commentCheckToolDefinition() {
    return {
        name: "comment_check",
        title: "Comment Check",
        description: "Run comment-checker against proposed file content or edits. Use after writing code comments or before finalizing edits.",
        inputSchema: {
            type: "object",
            properties: {
                cwd: {
                    type: "string",
                    description: "Workspace root. Defaults to the current process directory.",
                },
                filePath: {
                    type: "string",
                    description: "Path to the file being checked.",
                },
                content: {
                    type: "string",
                    description: "Complete file content for Write-style checks.",
                },
                oldString: {
                    type: "string",
                    description: "Previous text for Edit-style checks.",
                },
                newString: {
                    type: "string",
                    description: "New text for Edit-style checks.",
                },
                edits: {
                    type: "array",
                    description: "MultiEdit-style edits with oldString/newString fields.",
                    items: {
                        type: "object",
                        properties: {
                            oldString: { type: "string" },
                            newString: { type: "string" },
                        },
                        required: ["oldString", "newString"],
                    },
                },
            },
            required: ["filePath"],
        },
    };
}
function success(id, result) {
    return {
        jsonrpc: "2.0",
        id,
        result,
    };
}
function failure(id, code, message) {
    return {
        jsonrpc: "2.0",
        id,
        error: {
            code,
            message,
        },
    };
}
function textResult(text, isError) {
    return {
        content: [{ type: "text", text }],
        isError,
    };
}
function protocolVersion(params) {
    if (isRecord(params) && typeof params.protocolVersion === "string") {
        return params.protocolVersion;
    }
    return "2025-03-26";
}
function getString(input, key) {
    const value = input[key];
    return typeof value === "string" ? value : undefined;
}
function isJsonRpcRequest(value) {
    return isRecord(value) && value.jsonrpc === "2.0" && typeof value.method === "string";
}
//# sourceMappingURL=mcp.js.map