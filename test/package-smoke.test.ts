import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readJson(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

describe("plugin package metadata", () => {
	it("#given packaged plugin files #when validating entrypoints #then hook command uses portable plugin root interpolation", () => {
		// given
		const packageJson = readJson("package.json");
		const pluginJson = readJson(".codex-plugin/plugin.json");
		const hooksJson = readJson("hooks/hooks.json");
		const cliSource = readFileSync("src/cli.ts", "utf8");

		// when
		const bin = packageJson.bin as Record<string, unknown>;
		const dependencies = packageJson.dependencies as Record<string, unknown> | undefined;
		const hookConfig = hooksJson.hooks as Record<string, Array<{ hooks: Array<{ command: string }> }>>;
		const command = hookConfig.PostToolUse?.[0]?.hooks[0]?.command;
		const pluginRoot = ["$", "{PLUGIN_ROOT}"].join("");

		// then
		expect(packageJson.type).toBe("module");
		expect(packageJson.packageManager).toBe("npm@11.12.1");
		expect(dependencies ?? {}).not.toHaveProperty("@code-yeongyu/comment-checker");
		expect(packageJson.optionalDependencies).toHaveProperty("@code-yeongyu/comment-checker");
		expect(bin["codex-comment-checker"]).toBe("./dist/cli.js");
		expect(pluginJson.hooks).toBe("./hooks/hooks.json");
		expect(cliSource.startsWith("#!/usr/bin/env node")).toBe(true);
		expect(command).toBe(`node "${pluginRoot}/dist/cli.js" hook post-tool-use`);
	});
});
