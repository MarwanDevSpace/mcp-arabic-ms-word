---
name: docx-xml-surgeon
description: Skill for decompressing .docx archives, inspecting inner WordprocessingML XML structures (document.xml, styles.xml, numbering.xml, settings.xml), and applying surgical regex/node replacements.
---

# WordprocessingML XML Decompression & Surgery Skill

This skill provides advanced guidance for decompressing `.docx` zip archives and performing precision XML modifications.

## Inner XML Files Target Map

- `word/document.xml`: Main body content, paragraphs (`w:p`), runs (`w:r`), text (`w:t`), tables (`w:tbl`), and section properties (`w:sectPr`).
- `word/styles.xml`: Document style definitions, default font families (`w:rFonts`), heading styles, and paragraph spacing defaults.
- `word/numbering.xml`: Numbered and bulleted list definitions.
- `word/settings.xml`: Right-to-Left document level flags (`w:bidi`), zoom, and view settings.
- `word/header1.xml` / `word/footer1.xml`: Header and footer section XML structures.

## Surgical Workflow
1. Identify target inner file (e.g. `word/styles.xml` to change font definitions or `word/document.xml` to replace runs).
2. Execute `decompress_and_modify_word_xml` specifying `filePath`, `targetXmlPath`, `searchPattern`, and `replacementValue`.
3. Verify updated `.docx` archive via `inspect_word_document`.
