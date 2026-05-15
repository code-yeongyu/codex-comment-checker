---
name: comment-checker
description: Use when Codex needs to understand or respond to automatic comment-checker feedback emitted after an apply_patch edit.
---

# Codex Comment Checker

The plugin registers a `PostToolUse` hook for successful `apply_patch` calls.

When comment-checker reports a warning after a patch, Codex receives blocking feedback and should fix or explain the flagged comment before moving on.

## Scope

- No MCP tool is exposed.
- Non-`apply_patch` editing tools are ignored by this plugin.
- Missing checker binaries emit no hook output so normal Codex work can continue.
