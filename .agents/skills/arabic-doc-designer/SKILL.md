---
name: arabic-doc-designer
description: Universal master skill for designing, structuring, and generating all formats of Arabic and English Microsoft Word (.docx) documents (letters, reports, contracts, manuals, decisions, memos, academic papers, books, press releases, meeting minutes, and custom structured writings).
---

# Universal Arabic Document Designer & Logic Engine

This skill provides universal principles and dynamic reasoning for generating, structuring, styling, and polishing **ANY Microsoft Word document** in Arabic or English.

---

## 1. Dynamic Layout & Intent Analysis

Never limit documents to a fixed subset of types. When receiving ANY document request from the user, dynamically evaluate:

1. **Purpose & Tone**:
   - **Formal / Government / Legal**: Use high-clarity fonts (`Amiri`, `Traditional Arabic`), structured headers, justified alignment (`justify` or `kashida`), and formal sign-offs.
   - **Executive / Modern Corporate**: Use sleek sans fonts (`Cairo`, `Sakkal Majalla`), custom title colors (`#1F4E78`), styled data tables with alternating row colors, and KPI summaries.
   - **Technical / Documentation / Manuals**: Use structured H1-H6 heading hierarchies, bulleted/numbered lists, callout boxes, and code/table blocks.
   - **Academic / Literary / Creative**: Use clean margins, standard line spacing (1.25x - 1.5x), footnotes, and citations.

2. **Logical Structure Building**:
   - **Title Block**: H1 title, subtitle, author metadata, and creation date.
   - **Executive Summary / Intro**: Clear opening paragraph establishing context.
   - **Main Body**: Logically grouped H2/H3 sections with appropriate paragraph spacing.
   - **Visual Data**: Tables with `visuallyRightToLeft: true`, header shading, and clean borders.
   - **Page Setup**: A4 paper size, 2.54 cm margins, header text, and footers with Arabic page numbers (`صفحة X من Y`).

---

## 2. Universal Typography Guidelines

- **Direction**: Enable `rtl` (Right-To-Left) and `bidi` by default for Arabic content.
- **Font Palette**:
  - `Amiri`: Books, legal documents, official correspondence, formal letters.
  - `Cairo`: Executive reports, modern dashboards, corporate presentations.
  - `Traditional Arabic`: Classic administrative decisions, contracts, official decrees.
  - `Simplified Arabic`: General business documentation and memos.
- **Line Spacing**: 1.25x to 1.5x for optimal diacritic and ligature legibility.
- **Alignment**:
  - Main text: `justify` or `kashida` (`distribute`).
  - Headings & Labels: `right` or `center`.

---

## 3. Conversational Execution Strategy

1. **Understand & Execute Instantly**: Analyze the user's natural language prompt and execute tool calls immediately without requiring manual slash commands (`/command`).
2. **End-to-End Formatting**: Handle document creation, section structuring, table formatting, and page numbering in a seamless flow.
3. **Artifact Presentation**: Provide clickable file links (`file:///...`) for generated or modified `.docx` files.
