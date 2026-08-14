---
name: bidi-typography-surgeon
description: Universal master skill for surgical OpenXML repair of Arabic MS Word documents, fixing BiDi alignment drift, right-aligning headings with keepNext, justifying body text, protecting Quranic verses and Hadiths from splitting, and isolating English sections.
---

# 🩺 Bidi & Typography OpenXML Surgeon Skill

This skill provides specialized deep OpenXML surgical engineering patterns for Microsoft Word (`.docx`) documents to eliminate Arabic BiDi drift and guarantee publication-grade typography.

## Core Rules & Architecture

1. **Headings Alignment (`w:pPr`)**:
   - MUST have `<w:jc w:val="right"/>`.
   - MUST have `<w:keepNext/>` and `<w:widowControl/>` to prevent orphan headings.
   - MUST NOT have `<w:bidi/>` in `<w:pPr>` when `<w:jc w:val="right"/>` is present.
   - Text runs `<w:rPr>` MUST have `<w:rtl/>`.

2. **Arabic Body Paragraphs**:
   - MUST have `<w:bidi/>` and `<w:jc w:val="both"/>` for clean margin-to-margin Arabic justification (kashida).
   - Text runs `<w:rPr>` MUST have `<w:rtl/>`.

3. **Quranic Verses & Hadiths**:
   - Wrapped with `<w:keepLines/>` to prevent splitting across page boundaries.
   - Text runs `<w:rPr>` styled with distinctive colors and `<w:rtl/>`.

4. **English/Latin Sections**:
   - Strict left alignment `<w:jc w:val="left"/>`.
   - NO `<w:bidi/>` and NO `<w:rtl/>` in Latin text runs.

## Execution via MCP Tool

```json
{
  "tool": "enforce_arabic_bidi_and_typography",
  "arguments": {
    "document_path": "path/to/document.docx",
    "fix_headings_alignment": true,
    "justify_body_paragraphs": true,
    "prevent_verse_splitting": true,
    "inject_dynamic_page_numbering": true,
    "isolate_english_sections": true
  }
}
```
