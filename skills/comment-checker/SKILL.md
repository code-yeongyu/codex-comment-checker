---
name: comment-checker
description: Use when Codex should explicitly check newly written comments, audit a diff for unnecessary or misleading comments, or run the bundled comment_check MCP tool before finalizing code edits.
---

# Codex Comment Checker

Use the `codex-comment-checker` MCP server when the user asks to check comments or when a code edit adds or changes comments and you want a focused checker result.

The plugin also registers a `PostToolUse` hook for edit-style tools. When comment-checker reports a warning after a file edit, Codex receives blocking feedback and should fix or explain the flagged comment before moving on.

## MCP Tool

- `comment_check`
  - `filePath`: path to check.
  - `cwd`: workspace root, optional.
  - `content`: full file content for write-style checks.
  - `oldString` and `newString`: edit-style check.
  - `edits`: multi-edit style check with `oldString` / `newString` pairs.

Prefer checking the smallest changed content that still gives the checker enough context.
