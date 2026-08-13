import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addHeadingSchema = z.object({
  filePath: z.string().describe('Path to the .docx file'),
  text: z.string().describe('Heading text content'),
  level: z.number().int().min(1).max(6).optional().default(1).describe('Heading level (1=H1, 2=H2, etc.)'),
  fontFamily: z.string().optional().describe('Font name'),
  fontSizePt: z.number().optional().describe('Heading size in pt'),
  colorHex: z.string().optional().default('1F4E78').describe('Heading text color hex'),
  alignment: z.enum(['right', 'left', 'center', 'justify']).optional().default('right').describe('Heading alignment'),
  direction: z.enum(['rtl', 'ltr']).optional().default('rtl').describe('Text direction'),
});

export type AddHeadingInput = z.input<typeof addHeadingSchema>;

export async function handleAddHeading(
  input: AddHeadingInput
): Promise<StandardResultEnvelope> {
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
    return createErrorEnvelope(`Error adding heading: ${msg}`);
  }
}
