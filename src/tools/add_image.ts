import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addImageSchema = z.object({
  filePath: z.string().describe('Path to target .docx file to modify in-place'),
  imagePath: z.string().describe('Absolute or workspace path to valid input image file (PNG, JPEG, GIF)'),
  widthPx: z.number().optional().default(300).describe('Display width in pixels inside document layout (default: 300)'),
  heightPx: z.number().optional().default(200).describe('Display height in pixels inside document layout (default: 200)'),
  align: z.enum(['right', 'center', 'left']).optional().default('center').describe('Horizontal image positioning relative to text margins (right, center, left)'),
});

export type AddImageInput = z.input<typeof addImageSchema>;

export interface AddImageOutput {
  docPath: string;
  imgPath: string;
  widthPx: number;
  heightPx: number;
}

export async function handleAddImage(
  input: AddImageInput
): Promise<StandardResultEnvelope<AddImageOutput>> {
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
    return createErrorEnvelope(`Error adding image: ${msg}`) as StandardResultEnvelope<AddImageOutput>;
  }
}
