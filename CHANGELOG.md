# Changelog

## Unreleased

### Added

- Restore `write`, `edit`, `multi_edit`, and `multiedit` PostToolUse coverage alongside `apply_patch`.
- Forward Codex `transcript_path` into native comment-checker hook input when available.

## [0.1.1] - 2026-05-15

### Changed

- Limit automatic comment checking to successful `apply_patch` hook events.
- Remove the `comment_check` MCP tool and MCP server configuration.
- Update plugin metadata, docs, and contributor guidance to describe hook-only behavior.

## [0.1.0] - 2026-05-15

### Added

- Initial `codex-comment-checker` Codex plugin.
- `PostToolUse` hook for `apply_patch`, `write`, `edit`, and `multiedit` style tool calls.
- Blocking hook feedback when `comment-checker` reports warnings.
- `comment_check` MCP tool for explicit write/edit/multiedit checks.
- Codex plugin manifest, local MCP config, bundled skill, and GitHub repository metadata.
