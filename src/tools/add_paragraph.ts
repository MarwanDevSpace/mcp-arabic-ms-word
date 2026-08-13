import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addParagraphSchema = z.object({
  filePath: z.string().describe('Path to target .docx file to modify in-place'),
  text: z.string().describe('Paragraph text content string'),
  fontFamily: z.string().optional().describe('Font family name (e.g. Amiri, Cairo, Traditional Arabic)'),
  fontSizePt: z.number().optional().default(14).describe('Font size in points (default 14 pt)'),
  direction: z.enum(['rtl', 'ltr']).optional().default('rtl').describe('Text direction (rtl for Right-to-Left Arabic, ltr for English)'),
  alignment: z.enum(['right', 'left', 'center', 'justify', 'kashida']).optional().default('right').describe('Text alignment (right, left, center, justify, or kashida for Arabic justification)'),
  lineSpacingMultiplier: z.number().optional().default(1.25).describe('Line spacing height multiplier (default 1.25 for Arabic diacritics readability)'),
  spaceBeforePt: z.number().optional().default(0).describe('Spacing before paragraph in points'),
  spaceAfterPt: z.number().optional().default(6).describe('Spacing after paragraph in points (default 6 pt)'),
  colorHex: z.string().optional().default('000000').describe('Six-character hex color code without leading # (default 000000)'),
  bold: z.boolean().optional().default(false).describe('Set to true for bold text weight'),
  italic: z.boolean().optional().default(false).describe('Set to true for italic style'),
  underline: z.boolean().optional().default(false).describe('Set to true for underlined text'),
});

export type AddParagraphInput = z.input<typeof addParagraphSchema>;

export interface AddParagraphOutput {
  filePath: string;
  textPreview: string;
  alignment: string;
  direction: string;
}

export async function handleAddParagraph(
  input: AddParagraphInput
): Promise<StandardResultEnvelope<AddParagraphOutput>> {
  try {
    const validated = addParagraphSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    let handle = workspaceState.getDocumentHandle(resolvedPath);
    let builder: ArabicDocxBuilder;

    if (handle) {
      builder = handle.builder;
    } else {
      builder = new ArabicDocxBuilder();
      workspaceState.createDocumentHandle(resolvedPath, builder);
    }

    builder.addParagraph(validated.text, {
      fontFamily: validated.fontFamily,
      fontSizePt: validated.fontSizePt,
      direction: validated.direction,
      alignment: validated.alignment,
      lineSpacingMultiplier: validated.lineSpacingMultiplier,
      spaceBeforePt: validated.spaceBeforePt,
      spaceAfterPt: validated.spaceAfterPt,
      colorHex: validated.colorHex,
      bold: validated.bold,
      italic: validated.italic,
      underline: validated.underline,
    });

    await builder.saveToFile(resolvedPath);

    return createSuccessEnvelope(
      `Appended paragraph to '${validated.filePath}'`,
      {
        filePath: resolvedPath,
        textPreview: validated.text.substring(0, 40),
        alignment: validated.alignment,
        direction: validated.direction,
      },
      [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to add paragraph: ${msg}`);
    return createErrorEnvelope(`Error adding paragraph: ${msg}`) as StandardResultEnvelope<AddParagraphOutput>;
  }
}
