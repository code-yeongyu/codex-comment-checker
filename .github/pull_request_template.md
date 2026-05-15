## Summary

<!-- Brief description, 1-3 bullets -->

-

## Verification

- [ ] `npm run check` (typecheck + biome + build)
- [ ] `npm test` (unit tests)
- [ ] `npm pack --dry-run` (release sanity)
- [ ] Hook smoke-tested locally with `node dist/cli.js hook post-tool-use`
- [ ] MCP smoke-tested locally with `node dist/cli.js mcp`

## Codex plugin impact

- [ ] `.codex-plugin/plugin.json` remains valid
- [ ] `.mcp.json` still launches the MCP server from plugin root
- [ ] `hooks/hooks.json` still uses stable Codex hook JSON
- [ ] CHANGELOG entry added for user-facing changes
