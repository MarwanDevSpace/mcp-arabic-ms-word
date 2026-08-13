# Changelog

All notable changes to **mcp-arabic-ms-word** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-08-13

### Added
- Official Glama MCP Registry integration with `glama.json` schema specification.
- Added Glama server badges and registry configurations to `README.md`.
- Created official GitHub Release `v1.1.2`.

## [1.1.0] - 2026-08-13

### Added
- New Master Agent Persona Guide: [`WORD_MASTER_AGENT.md`](WORD_MASTER_AGENT.md) unifying all tools, skills, and execution protocols.
- New Tool: `repair_arabic_text_formatting` for fixing inverted parentheses/brackets, digit standardization (Eastern/Western), whitespace trimming, tatweel/kashida stripping, and Alef/Yeh normalizations.
- New Tool: `decompress_and_modify_word_xml` for decompressing `.docx` archives and performing deep regex/pattern replacements inside `word/document.xml`, `word/styles.xml`, `word/numbering.xml`, and `word/settings.xml`.
- New Skill: [arabic-text-repair](.agents/skills/arabic-text-repair/SKILL.md).
- New Skill: [docx-xml-surgeon](.agents/skills/docx-xml-surgeon/SKILL.md).

## [1.0.1] - 2026-08-13

### Updated
- Updated standard client configuration to use `npx -y mcp-arabic-ms-word@latest`.
- Updated `README.md` documentation in both Arabic and English.
- Updated `mcp_config.json` integration settings.

## [1.0.0] - 2026-08-13

### Added
- Complete MCP server implementation (`mcp-arabic-ms-word`) for Microsoft Word document management.
- Arabic typography engine supporting RTL (`bidi`), font families (`Amiri`, `Traditional Arabic`, `Cairo`, etc.), Kashida justification (`distribute`), line height, and unit conversions.
- 11 MCP Tools including `resolve_and_execute_document_intent`, `create_word_document`, `inspect_word_document`, `add_paragraph_to_document`, `add_heading_to_document`, `add_table_to_document`, `add_image_to_document`, `add_header_footer_to_document`, `modify_word_xml_element`, `inject_template_data`, `convert_word_to_markdown`.
- 3 MCP Resources: `word://workspace/documents`, `word://templates/arabic-standard`, `word://fonts/arabic-registry`.
- 3 MCP Prompts: `generate-arabic-official-letter`, `generate-arabic-report`, `audit-arabic-doc-typography`.
- Path traversal security guard (`resolveWorkspacePath`).
- Unit and integration test suite with 100% pass rate.
