import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addHeadingSchema = z.object({
  filePath: z.string().describe('Path to target .docx file to modify in-place'),
  text: z.string().describe('Heading text content string'),
  level: z.number().int().min(1).max(6).optional().default(1).describe('Heading structural level 1 to 6 (1 for main H1 title, 2 for section H2, etc.)'),
  fontFamily: z.string().optional().describe('Font family name (e.g. Amiri, Cairo). Defaults to document default font if omitted'),
  fontSizePt: z.number().optional().describe('Font size in points (e.g. 22 for H1, 18 for H2). Calculated automatically if omitted'),
  colorHex: z.string().optional().default('1F4E78').describe('Six-character hex color code without leading # (e.g. 1F4E78 for executive dark blue)'),
  alignment: z.enum(['right', 'left', 'center', 'justify']).optional().default('right').describe('Horizontal alignment (right, left, center, justify)'),
  direction: z.enum(['rtl', 'ltr']).optional().default('rtl').describe('Text direction flag (rtl for Right-to-Left Arabic, ltr for English)'),
});

export type AddHeadingInput = z.input<typeof addHeadingSchema>;

export interface AddHeadingOutput {
  filePath: string;
  headingText: string;
  level: number;
}

export async function handleAddHeading(
  input: AddHeadingInput
): Promise<StandardResultEnvelope<AddHeadingOutput>> {
  try {
    const validated = addHeadingSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    let handle = workspaceState.getDocumentHandle(resolvedPath);
    let builder: ArabicDocxBuilder;

    if (handle) {
      builder = handle.builder;
    } else {
      builder = new ArabicDocxBuilder();
      workspaceState.createDocumentHandle(resolvedPath, builder);
    }

    builder.addHeading(validated.text, validated.level as 1 | 2 | 3 | 4 | 5 | 6, {
      fontFamily: validated.fontFamily,
      fontSizePt: validated.fontSizePt,
      colorHex: validated.colorHex,
      alignment: validated.alignment,
      direction: validated.direction,
    });

    await builder.saveToFile(resolvedPath);

    return createSuccessEnvelope(
      `Appended H${validated.level} heading to '${validated.filePath}'`,
      {
        filePath: resolvedPath,
        headingText: validated.text,
        level: validated.level,
      },
      [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to add heading: ${msg}`);
    return createErrorEnvelope(`Error adding heading: ${msg}`) as StandardResultEnvelope<AddHeadingOutput>;
  }
}
