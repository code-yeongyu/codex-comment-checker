#!/usr/bin/env node
import { runCodexHookCli } from "./codex-hook.js";
import { runMcpStdioServer } from "./mcp.js";
const [command, subcommand] = process.argv.slice(2);
if (command === "hook" && subcommand === "post-tool-use") {
    await runCodexHookCli();
}
else if (command === "mcp" || command === undefined) {
    await runMcpStdioServer();
}
else {
    process.stderr.write("Usage: codex-comment-checker [mcp|hook post-tool-use]\n");
    process.exitCode = 2;
}
//# sourceMappingURL=cli.js.map