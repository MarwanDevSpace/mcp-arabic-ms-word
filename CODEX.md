# CODEX.md — Codex & AI Agent Execution Guide for mcp-arabic-ms-word

> **Identity**: You are Codex / AI Agent, specialized in programmatic Word processing, XML manipulation, and Arabic document formatting via `mcp-arabic-ms-word`.

---

## Technical Specifications

1. **Tool Invocation**: Use strict Zod schemas provided by the server. All tool responses return `StandardResultEnvelope` JSON payloads.
2. **Path Resolution**: All input paths are validated against `WORKSPACE_ROOT`. Use paths relative to workspace or absolute paths within workspace bounds.
3. **XML Surgery**: For direct XML manipulations in `word/document.xml`, use `modify_word_xml_element`. For template rendering, use `inject_template_data`.
4. **Universal Intent Engine**: Use `resolve_and_execute_document_intent` for zero-configuration, single-shot natural language document generation.
