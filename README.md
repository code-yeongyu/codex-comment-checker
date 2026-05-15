# codex-comment-checker

[![ci](https://github.com/code-yeongyu/codex-comment-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/code-yeongyu/codex-comment-checker/actions/workflows/ci.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Codex plugin that runs [`@code-yeongyu/comment-checker`](https://github.com/code-yeongyu/go-claude-code-comment-checker) after edit-style tool calls and exposes a `comment_check` MCP tool.

## Behavior

| Case | Result |
|------|--------|
| `apply_patch` succeeds | parses `tool_input.command` and checks added/updated files |
| `write` succeeds | checks written `content` |
| `edit` succeeds | checks `oldString` / `newString` |
| `multiedit` succeeds | checks each edit payload |
| checker exits `2` | returns Codex `PostToolUse` blocking feedback so the model fixes or explains the warning |
| checker binary missing | emits no hook output; the MCP tool reports the missing dependency |
| checker exits unexpectedly | leaves hook output unchanged; the MCP tool reports an error |

Deletes are ignored because they cannot introduce new comments.

## Codex Plugin

The plugin ships:

- `.codex-plugin/plugin.json` for Codex plugin discovery.
- `.mcp.json` for the `codex-comment-checker` MCP server.
- `hooks/hooks.json` for the `PostToolUse` hook.
- `skills/comment-checker/SKILL.md` with usage guidance.

The hook command is:

```bash
node "$PLUGIN_ROOT/dist/cli.js" hook post-tool-use
```

The MCP command is:

```bash
node ./dist/cli.js mcp
```

## Local Development

```bash
npm install
npm test
npm run typecheck
npm run check
npm pack --dry-run
```

Smoke-test the hook:

```bash
node dist/cli.js hook post-tool-use < test/fixtures/post-tool-use.json
```

Smoke-test the MCP server by sending JSON-RPC lines over stdin:

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/cli.js mcp
```

## Local Codex Installation

From the marketplace root containing this plugin:

```bash
codex plugin marketplace add /path/to/codex-plugins
```

If your local Codex build does not yet expose `codex plugin add`, install from the UI or copy the plugin into `~/.codex/plugins/cache/<marketplace>/codex-comment-checker/0.1.0` and enable:

```toml
[plugins."codex-comment-checker@code-yeongyu-codex-plugins"]
enabled = true
```

## Branch Rules and Releases

- `main` is protected by `.github/branch-ruleset.json`.
- CI runs Node 20 and 22 on Ubuntu and macOS.
- Releases are GitHub Releases tagged as `v<semver>`.
- Publishing runs from the `publish` workflow after a GitHub Release is published.

## Privacy

This plugin runs locally. It sends hook input to the local `comment-checker` binary and does not call a network service by itself.

## License

[MIT](LICENSE).

## Related

- [pi-comment-checker](https://github.com/code-yeongyu/pi-comment-checker) - source extension this Codex plugin ports.
- [comment-checker](https://github.com/code-yeongyu/go-claude-code-comment-checker) - native checker binary.
