import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import type { CommentCheckerHookInput } from "./core.js";

export type ProcessResult = {
	exitCode: number | null;
	stdout: string;
	stderr: string;
};

export type ProcessExecutor = (command: string, args: string[], stdin: string) => Promise<ProcessResult>;

export type RunCommentCheckerOptions = {
	binaryPath?: string;
	customPrompt?: string;
	resolveBinary?: () => string | undefined;
	executor?: ProcessExecutor;
};

export type CommentCheckerRunResult = {
	status: "pass" | "warning" | "error" | "missing";
	message: string;
	binaryPath?: string;
	exitCode?: number | null;
	stdout?: string;
	stderr?: string;
};

export type CommentCheckerRunner = (input: CommentCheckerHookInput) => Promise<CommentCheckerRunResult>;

export async function runCommentChecker(
	input: CommentCheckerHookInput,
	options: RunCommentCheckerOptions = {},
): Promise<CommentCheckerRunResult> {
	const binaryPath =
		options.binaryPath ?? (options.resolveBinary ? options.resolveBinary() : resolveCommentCheckerBinary());
	if (!binaryPath) {
		return {
			status: "missing",
			message: "comment-checker binary not found. Run npm install for the codex-comment-checker plugin.",
		};
	}

	const args = ["check"];
	if (options.customPrompt) {
		args.push("--prompt", options.customPrompt);
	}

	const executor = options.executor ?? spawnProcess;
	const result = await executor(binaryPath, args, JSON.stringify(input));
	const message = result.stderr || result.stdout;
	if (result.exitCode === 0) {
		return {
			status: "pass",
			message: "",
			binaryPath,
			exitCode: result.exitCode,
			stdout: result.stdout,
			stderr: result.stderr,
		};
	}
	if (result.exitCode === 2) {
		return {
			status: "warning",
			message,
			binaryPath,
			exitCode: result.exitCode,
			stdout: result.stdout,
			stderr: result.stderr,
		};
	}
	return {
		status: "error",
		message,
		binaryPath,
		exitCode: result.exitCode,
		stdout: result.stdout,
		stderr: result.stderr,
	};
}

export function resolveCommentCheckerBinary(): string | undefined {
	const binaryName = process.platform === "win32" ? "comment-checker.exe" : "comment-checker";
	const fromPackage = resolvePackageBinary(binaryName);
	if (fromPackage) return fromPackage;
	return undefined;
}

function resolvePackageBinary(binaryName: string): string | undefined {
	try {
		const require = createRequire(import.meta.url);
		const packagePath = require.resolve("@code-yeongyu/comment-checker/package.json");
		const binaryPath = join(dirname(packagePath), "bin", binaryName);
		return existsSync(binaryPath) ? binaryPath : undefined;
	} catch {
		return undefined;
	}
}

function spawnProcess(command: string, args: string[], stdin: string): Promise<ProcessResult> {
	return new Promise((resolve) => {
		const proc = spawn(command, args, {
			stdio: ["pipe", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";

		proc.stdout.setEncoding("utf-8");
		proc.stderr.setEncoding("utf-8");
		proc.stdout.on("data", (chunk: string) => {
			stdout += chunk;
		});
		proc.stderr.on("data", (chunk: string) => {
			stderr += chunk;
		});
		proc.once("error", (error) => {
			resolve({
				exitCode: null,
				stdout,
				stderr: `${stderr}${error.message}`,
			});
		});
		proc.once("close", (exitCode) => {
			resolve({ exitCode, stdout, stderr });
		});
		proc.stdin.end(stdin);
	});
}
