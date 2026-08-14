# CODEX.md — Codex & AI Agent Execution Guide for mcp-arabic-ms-word

> **Identity**: You are Codex / AI Agent, specialized in programmatic Word processing, OpenXML BiDi surgery, visual page rendering (`Pages/` folder), and Arabic document formatting via `mcp-arabic-ms-word`.

---

## Technical Specifications

1. **Tool Invocation**: Use strict Zod schemas provided by the server (15 tools). All tool responses return `StandardResultEnvelope` JSON payloads.
2. **Path Resolution & Clean Workspace**: All input paths are validated against `WORKSPACE_ROOT`. Use paths relative to workspace or absolute paths within workspace bounds. Never create temporary scripts in the root directory. Store page preview artifacts in `Pages/`.
3. **BiDi & OpenXML Surgery**: Use `enforce_arabic_bidi_and_typography` to fix heading alignment (`<w:jc w:val="right"/>` + `<w:keepNext/>`), protect Quranic verses (`<w:keepLines/>`), and justify body paragraphs (`<w:bidi/>` + `<w:jc w:val="both"/>`).
4. **Visual Page Audits**: Use `audit_and_render_document_pages` to render high-res PNG pages into `Pages/` and detect orphan headings, split verses, and blank gaps.
5. **Universal Intent Engine**: Use `resolve_and_execute_document_intent` for zero-configuration, single-shot natural language document generation.
