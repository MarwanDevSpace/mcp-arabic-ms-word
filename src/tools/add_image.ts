import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addImageSchema = z.object({
  filePath: z.string().describe('Path to the .docx file'),
  imagePath: z.string().describe('Path to the PNG/JPEG image file'),
  widthPx: z.number().optional().default(300).describe('Image display width in pixels'),
  heightPx: z.number().optional().default(200).describe('Image display height in pixels'),
  align: z.enum(['right', 'center', 'left']).optional().default('center').describe('Image alignment'),
});

export type AddImageInput = z.input<typeof addImageSchema>;

export async function handleAddImage(
  input: AddImageInput
): Promise<StandardResultEnvelope> {
  try {
    const validated = addImageSchema.parse(input);
    const resolvedDocPath = resolveWorkspacePath(validated.filePath);
    const resolvedImgPath = resolveWorkspacePath(validated.imagePath);

    let handle = workspaceState.getDocumentHandle(resolvedDocPath);
    let builder: ArabicDocxBuilder;

    if (handle) {
      builder = handle.builder;
    } else {
      builder = new ArabicDocxBuilder();
      workspaceState.createDocumentHandle(resolvedDocPath, builder);
    }

    builder.addImage(resolvedImgPath, validated.widthPx, validated.heightPx, validated.align);
    await builder.saveToFile(resolvedDocPath);

    return createSuccessEnvelope(
      `Appended image to '${validated.filePath}'`,
      {
        docPath: resolvedDocPath,
        imgPath: resolvedImgPath,
        widthPx: validated.widthPx,
        heightPx: validated.heightPx,
      },
      [{ label: 'Updated Docx', uri: `file:///${resolvedDocPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to add image: ${msg}`);
    return createErrorEnvelope(`Error adding image: ${msg}`);
  }
}
