---
name: word-xml-injector
description: Advanced skill for inspecting, parsing, modifying, and injecting raw WordprocessingML XML elements and templates into Microsoft Word (.docx) files.
---

# WordprocessingML XML Injector & Template Skill

This skill guides deep inspection and surgical modifications of `.docx` WordprocessingML XML structures.

## Core Workflows

### 1. Template Placeholder Injection
Use `inject_template_data` when working with template `.docx` files containing placeholders:
- Text tags: `{client_name}`, `{date}`, `{amount}`
- Paragraph loops: `{#items}{name}: {price}{/items}`

### 2. Surgical XML Node Replacement
Use `modify_word_xml_element` when you need to inject specific WordprocessingML tags directly into `word/document.xml`:
- Injecting custom RTL run attributes: `<w:rPr><w:rtl/><w:rFonts w:cs="Amiri"/></w:rPr>`
- Replacing text strings across all runs without altering surrounding formatting.

### 3. XML Structure Inspection
Use `inspect_word_document` to analyze paragraph node structures, font definitions, table XML blocks, and embedded media before applying XML transformations.
