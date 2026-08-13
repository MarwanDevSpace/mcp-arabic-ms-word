---
name: arabic-text-repair
description: Skill for detecting, repairing, and standardizing Arabic text typography, fixing inverted punctuation, Tatweel/Kashida normalization, digit formatting (Eastern/Western), and Alef/Yeh forms.
---

# Arabic Text Repair & Typography Skill

This skill guides the automatic diagnosis and repair of Arabic text defects in Microsoft Word documents.

## Common Defects & Solutions

1. **Inverted Parentheses & Punctuation**:
   - In mixed RTL/LTR blocks, brackets like `( ` and ` )` get inverted visually.
   - Solution: Use `repair_arabic_text_formatting` with `fixInvertedPunctuation: true`.

2. **Digit Standardization**:
   - Inconsistent mixing of Western (0-9) and Eastern (٠-٩) digits.
   - Solution: Standardize digits via `standardizeDigits: 'eastern'` or `'western'`.

3. **Alef & Yeh Normalization**:
   - Normalizing search queries or indexing by converting `أ`, `إ`, `آ` to `ا` and `ى` to `ي`.
   - Solution: Enable `normalizeAlef: true` and `normalizeYeh: true`.

4. **Excess Kashida Removal**:
   - Stripping unwanted tatweel (`ـ`) characters from extracted text.
   - Solution: Enable `removeKashida: true`.
