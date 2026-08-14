# Changelog

All notable changes to **mcp-arabic-ms-word** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-08-14

### Added
- **New Tool**: `enforce_arabic_bidi_and_typography`
  - Eliminates BiDi/RTL heading drift by strictly enforcing `<w:jc w:val="right"/>` without `<w:bidi/>` in heading `pPr`.
  - Enforces `<w:keepNext/>` and `<w:widowControl/>` on all heading levels to eliminate orphan headings.
  - Enforces `<w:bidi/>` and `<w:jc w:val="both"/>` on Arabic body paragraphs.
  - Wraps Quranic verses and Hadiths with `<w:keepLines/>` to prevent them from splitting across page breaks.
  - Injects dynamic Arabic page numbering into section footers.
  - Isolates English/Latin sections with strict left alignment (`<w:jc w:val="left"/>`).
- **New Tool**: `audit_and_render_document_pages`
  - Converts Word documents to PDF and renders all pages as high-resolution PNG images in a dedicated `Pages/` subfolder.
  - Performs automated layout defect diagnostics (orphan headings, split verses, trailing blank lines, layout integrity score).
- **Clean Workspace Protocol**:
  - Eliminates temporary script pollution in user root directories.
  - Enforces internal MCP server execution and standardized workspace structure (`document.docx`, `document.pdf`, `Pages/`).
- **New Skills**:
  - [bidi-typography-surgeon](.agents/skills/bidi-typography-surgeon/SKILL.md)
  - [visual-page-auditor](.agents/skills/visual-page-auditor/SKILL.md)

## [1.2.1] - 2026-08-13

### Enhanced
- **Full Glama 5.0/5.0 Quality Optimization across all Tools**:
  - Registered formal `outputSchema` definitions on all tools providing typed return shape specifications.
  - Added structural `annotations` (`readOnly`, `destructive`, `idempotent`, `openWorld`) to each tool.
  - Enriched behavioral disclosures covering side effects, in-place vs new file creation, overwrite rules, error conditions, and return envelope format.
  - Added explicit usage guidelines for every tool ("WHEN TO USE", "WHEN NOT TO USE", and "ALTERNATIVES").
  - Added 100% parameter coverage with usage intent, formatting rules (Hex colors, pt sizes, cm units), and cross-parameter relationships.

## [1.2.0] - 2026-08-13

### Added & Improved
- Added tool `annotations` across all tools.
- Enriched behavioral disclosures.
- Published release `v1.2.0` on npm Registry and GitHub Releases.

## [1.1.3] - 2026-08-13

### Added
- Added official logo artwork (`assets/ms-ar.png`) to `README.md` header.

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
