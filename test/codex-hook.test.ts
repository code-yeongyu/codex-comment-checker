import { describe, expect, it } from "vitest";

import {
	type CodexPostToolUseInput,
	extractCodexCommentCheckRequests,
	runCommentCheckerPostToolUse,
} from "../src/codex-hook.ts";

function postToolUseInput(overrides: Partial<CodexPostToolUseInput> = {}): CodexPostToolUseInput {
	return {
		session_id: "thread-1",
		turn_id: "turn-1",
		transcript_path: null,
		cwd: "/repo",
		hook_event_name: "PostToolUse",
		model: "gpt-5.5",
		permission_mode: "never",
		tool_name: "apply_patch",
		tool_input: {
			command: [
				"*** Begin Patch",
				"*** Update File: src/example.ts",
				"@@",
				"-const value = 1;",
				"+// explains value",
				"+const value = 2;",
				"*** End Patch",
			].join("\n"),
		},
		tool_response: "Success. Updated files.",
		tool_use_id: "call-1",
		...overrides,
	};
}

describe("extractCodexCommentCheckRequests", () => {
	it("#given codex apply_patch command #when extracting #then returns edit request for changed file", () => {
		const requests = extractCodexCommentCheckRequests(postToolUseInput());

		expect(requests).toEqual([
			{
				sourceToolName: "apply_patch",
				toolName: "Edit",
				filePath: "src/example.ts",
				toolInput: {
					file_path: "src/example.ts",
					old_string: "const value = 1;\n",
					new_string: "// explains value\nconst value = 2;\n",
				},
			},
		]);
	});

	it("#given unsupported post tool event #when extracting #then returns no requests", () => {
		const requests = extractCodexCommentCheckRequests(
			postToolUseInput({
				tool_name: "Write",
				tool_input: { file_path: "src/example.ts", content: "// hi\nconst value = 1;\n" },
			}),
		);

		expect(requests).toEqual([]);
	});
});

describe("runCommentCheckerPostToolUse", () => {
	it("#given checker warning #when hook runs #then returns blocking feedback JSON", async () => {
		const output = await runCommentCheckerPostToolUse(postToolUseInput(), {
			run: async () => ({
				status: "warning",
				message: "comment warning: explain less",
			}),
		});

		expect(JSON.parse(output)).toEqual({
			decision: "block",
			reason: "comment-checker found issues in src/example.ts:\ncomment warning: explain less",
		});
	});

	it("#given missing checker binary #when hook runs #then emits no hook output", async () => {
		const output = await runCommentCheckerPostToolUse(postToolUseInput(), {
			run: async () => ({
				status: "missing",
				message: "not installed",
			}),
		});

		expect(output).toBe("");
	});
});
