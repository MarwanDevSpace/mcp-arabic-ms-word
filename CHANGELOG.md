# Changelog

All notable changes to **mcp-arabic-ms-word** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-13

### Added
- Complete MCP server implementation (`mcp-arabic-ms-word`) for Microsoft Word document management.
- Arabic typography engine supporting RTL (`bidi`), font families (`Amiri`, `Traditional Arabic`, `Cairo`, etc.), Kashida justification (`distribute`), line height, and unit conversions.
- 10 MCP Tools: `create_word_document`, `inspect_word_document`, `add_paragraph_to_document`, `add_heading_to_document`, `add_table_to_document`, `add_image_to_document`, `add_header_footer_to_document`, `modify_word_xml_element`, `inject_template_data`, `convert_word_to_markdown`.
- 3 MCP Resources: `word://workspace/documents`, `word://templates/arabic-standard`, `word://fonts/arabic-registry`.
- 3 MCP Prompts: `generate-arabic-official-letter`, `generate-arabic-report`, `audit-arabic-doc-typography`.
- Path traversal security guard (`resolveWorkspacePath`).
- Unit and integration test suite with 100% pass rate.
