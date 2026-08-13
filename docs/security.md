# Security Posture: mcp-arabic-ms-word

## Threat Model & Safeguards

| Risk Area | Threat Description | Security Control |
|---|---|---|
| **Path Traversal** | Malicious input trying to write `.docx` or read files outside workspace boundary (e.g. `../../Windows/System32`). | `resolveWorkspacePath()` canonicalizes target paths and verifies they reside strictly inside `WORKSPACE_ROOT`. Rejects violations with `SecurityError`. |
| **Protocol Pollution** | Console logs polluting `stdout` JSON-RPC stream, breaking MCP client parsing. | `Logger` class writes exclusively to `process.stderr`. `stdout` is reserved strictly for protocol JSON-RPC messages. |
| **Input Abuse** | Invalid or corrupt parameters passed to tools. | Input parameters are validated at the tool boundary using strict `Zod` schemas before execution. |
| **Data Leakage** | System secrets or internal paths leaking in tool result output. | Result envelopes sanitize evidence and present normalized error messages without raw stack traces. |
| **XML Expansion (Billion Laughs)** | XML entity expansion attacks when parsing uploaded `.docx` files. | `fast-xml-parser` is configured without entity expansion support. |
