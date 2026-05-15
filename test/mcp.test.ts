import { describe, expect, it } from "vitest";

import { createCommentCheckerMcpHandler } from "../src/mcp.ts";

describe("createCommentCheckerMcpHandler", () => {
	it("#given initialize request #when handled #then returns MCP tool capability", async () => {
		const handle = createCommentCheckerMcpHandler();

		const response = await handle({
			jsonrpc: "2.0",
			id: 1,
			method: "initialize",
			params: {
				protocolVersion: "2025-03-26",
			},
		});

		expect(response).toMatchObject({
			jsonrpc: "2.0",
			id: 1,
			result: {
				capabilities: {
					tools: {
						listChanged: false,
					},
				},
				serverInfo: {
					name: "codex-comment-checker",
					version: "0.1.0",
				},
				protocolVersion: "2025-03-26",
			},
		});
	});

	it("#given tools/list request #when handled #then exposes comment_check tool", async () => {
		const handle = createCommentCheckerMcpHandler();

		const response = await handle({
			jsonrpc: "2.0",
			id: 2,
			method: "tools/list",
		});

		expect(response).toMatchObject({
			jsonrpc: "2.0",
			id: 2,
			result: {
				tools: [
					{
						name: "comment_check",
					},
				],
			},
		});
	});

	it("#given comment_check call #when checker warns #then returns warning content", async () => {
		const handle = createCommentCheckerMcpHandler({
			run: async () => ({
				status: "warning",
				message: "comment warning",
			}),
		});

		const response = await handle({
			jsonrpc: "2.0",
			id: 3,
			method: "tools/call",
			params: {
				name: "comment_check",
				arguments: {
					cwd: "/repo",
					filePath: "src/example.ts",
					content: "// too much\nconst x = 1;\n",
				},
			},
		});

		expect(response).toEqual({
			jsonrpc: "2.0",
			id: 3,
			result: {
				content: [{ type: "text", text: "comment warning" }],
				isError: false,
			},
		});
	});
});
