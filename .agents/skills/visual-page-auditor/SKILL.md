---
name: visual-page-auditor
description: Master skill for visual page rendering, layout defect auditing, and workspace hygiene in Microsoft Word documents, organizing rendered page images in a dedicated Pages/ folder.
---

# 👁️ Visual Page Auditor & Workspace Hygiene Skill

This skill provides automated visual page inspection, defect detection, and clean workspace management for Microsoft Word documents.

## Core Capabilities

1. **Dedicated `Pages/` Subfolder**:
   - Converts DOCX to PDF and rasterizes high-resolution PNG images (`Pages/page_01.png`, `Pages/page_02.png`, etc.) directly into a clean, dedicated `Pages/` folder.
   - Prevents workspace clutter and file pollution.

2. **Automated Layout Defect Auditing**:
   - Detects orphan headings at page boundaries.
   - Flags split Quranic verses and Hadiths.
   - Detects trailing blank lines and abnormal line spacing.
   - Computes layout integrity score (0-100%).

3. **Workspace Hygiene Protocol**:
   - Zero scattered python/temp scripts in user root directory.
   - Restricts workspace outputs strictly to:
     - `document.docx`
     - `document.pdf`
     - `Pages/` folder containing rendered PNG images.

## Execution via MCP Tool

```json
{
  "tool": "audit_and_render_document_pages",
  "arguments": {
    "document_path": "path/to/document.docx",
    "output_folder_name": "Pages",
    "dpi": 150,
    "detect_layout_defects": true
  }
}
```
