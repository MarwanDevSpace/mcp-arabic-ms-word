import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addParagraphSchema = z.object({
  filePath: z.string().describe('Path to the .docx file to append paragraph to'),
  text: z.string().describe('Paragraph text content (Arabic/English)'),
  fontFamily: z.string().optional().describe('Font name (e.g. Amiri, Traditional Arabic, Cairo, Calibri)'),
  fontSizePt: z.number().optional().default(14).describe('Font size in points'),
  direction: z.enum(['rtl', 'ltr']).optional().default('rtl').describe('Text direction'),
  alignment: z.enum(['right', 'left', 'center', 'justify', 'kashida']).optional().default('right').describe('Paragraph alignment'),
  lineSpacingMultiplier: z.number().optional().default(1.25).describe('Line spacing (e.g., 1.0, 1.25, 1.5, 2.0)'),
  spaceBeforePt: z.number().optional().default(0).describe('Spacing before paragraph in pt'),
  spaceAfterPt: z.number().optional().default(6).describe('Spacing after paragraph in pt'),
  colorHex: z.string().optional().default('000000').describe('Text color hex code'),
  bold: z.boolean().optional().default(false).describe('Bold font weight'),
  italic: z.boolean().optional().default(false).describe('Italic font style'),
  underline: z.boolean().optional().default(false).describe('Underline text'),
});

export type AddParagraphInput = z.input<typeof addParagraphSchema>;

export async function handleAddParagraph(
  input: AddParagraphInput
): Promise<StandardResultEnvelope> {
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
    return createErrorEnvelope(`Error adding paragraph: ${msg}`);
  }
}
