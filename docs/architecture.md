# Architecture Blueprint: mcp-arabic-ms-word

## Overview
`mcp-arabic-ms-word` is a layered Model Context Protocol (MCP) server engineered for high-precision Microsoft Word (.docx) generation, editing, inspection, and XML manipulation with full Arabic RTL typography support.

## Layered Design

```
mcp-arabic-ms-word/
├── src/
│   ├── index.ts                 # CLI & Stdio Transport Process Entrypoint
│   ├── server.ts                # Server Factory & Capabilities Registration
│   ├── config/                  # Environment & Config Parsing
│   ├── core/                    # Error Taxonomy & Stderr Logger
│   ├── contracts/               # Standard MCP Result Envelopes & Types
│   ├── domain/                  # Arabic Typography, Docx Builder, XML Engine, Template Engine
│   ├── security/                # Path Canonicalization & Boundary Enforcement
│   ├── state/                   # Active Handles & Document Discovery
│   ├── tools/                   # Isolated Tool Execution Handlers
│   ├── resources/               # MCP Resource Endpoints
│   └── prompts/                 # MCP Guided Prompts
```

## Key Components

1. **`ArabicTypography`**: Handles units conversion (points to dxa/half-pts, cm to dxa), font aliases, Eastern Arabic digit conversion (`٠-٩`), and RTL alignment mapping (`distribute` for Kashida).
2. **`ArabicDocxBuilder`**: High-level typed document builder wrapping the `docx` library. Constructs paragraphs, headings, tables (`w:bidiVisual`), headers/footers, and embedded images.
3. **`ArabicXmlEngine`**: Zip extractor and fast XML parser/builder for `.docx` files. Inspects internal structure, counts elements, extracts text as Markdown, and performs text replacements in `word/document.xml`.
4. **`ArabicTemplateEngine`**: Uses `docxtemplater` & `pizzip` to inject JSON data into document template placeholders.
5. **`WorkspaceSecurity`**: Validates all paths against `WORKSPACE_ROOT` to prevent arbitrary file reading/writing outside project scope.
