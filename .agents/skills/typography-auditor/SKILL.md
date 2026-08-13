---
name: typography-auditor
description: Skill for auditing existing Word documents for Arabic typography compliance, font consistency, RTL alignment, kashida justification, and margin setup.
---

# Arabic Typography Auditor Skill

This skill provides diagnostic patterns for auditing Word documents.

## Audit Checklist

1. **RTL Compliance**:
   - Verify `w:rtl` / `w:bidi` attributes on paragraphs.
   - Verify `w:bidiVisual` or `visuallyRightToLeft` on tables.
2. **Font Consistency**:
   - Check if Arabic fonts (`Amiri`, `Traditional Arabic`, `Cairo`, `Sakkal Majalla`) are consistently applied.
   - Ensure fallback fonts (`Arial`, `Calibri`) are configured for numbers and mixed LTR segments.
3. **Line Spacing & Alignment**:
   - Confirm line spacing multiplier is at least 1.25x for Arabic diacritics.
   - Verify formal paragraphs use `justify` or `kashida` (`distribute`).
4. **Header & Footer Setup**:
   - Ensure Arabic page numbering (`صفحة X من Y`) is centered or right-aligned.

## Audit Execution Flow
1. Run `inspect_word_document` on target `.docx`.
2. Run `convert_word_to_markdown` to check textual flow.
3. Generate audit summary report with actionable improvement recommendations.
