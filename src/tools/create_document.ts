import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { workspaceState } from '../state/workspace_state.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const createDocumentSchema = z.object({
  filePath: z.string().describe('Output .docx file path relative to workspace or absolute'),
  title: z.string().optional().describe('Document title metadata'),
  author: z.string().optional().describe('Document author metadata'),
  subject: z.string().optional().describe('Document subject metadata'),
  pageSize: z.enum(['A4', 'Letter', 'A3']).optional().default('A4').describe('Paper size'),
  orientation: z.enum(['portrait', 'landscape']).optional().default('portrait').describe('Page orientation'),
  defaultFont: z.string().optional().default('Amiri').describe('Default Arabic font family'),
  marginTopCm: z.number().optional().default(2.54).describe('Top margin in centimeters'),
  marginBottomCm: z.number().optional().default(2.54).describe('Bottom margin in centimeters'),
  marginLeftCm: z.number().optional().default(2.54).describe('Left margin in centimeters'),
  marginRightCm: z.number().optional().default(2.54).describe('Right margin in centimeters'),
});

export type CreateDocumentInput = z.input<typeof createDocumentSchema>;

export interface CreateDocumentOutput {
  filePath: string;
  pageSize: string;
  orientation: string;
  defaultFont: string;
}

export async function handleCreateDocument(
  input: CreateDocumentInput
): Promise<StandardResultEnvelope<CreateDocumentOutput>> {
  try {
    const validated = createDocumentSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    Logger.info(`Creating new Arabic DOCX document at '${resolvedPath}'`);

    const builder = new ArabicDocxBuilder({
      title: validated.title,
      author: validated.author,
      subject: validated.subject,
      pageSize: validated.pageSize,
      orientation: validated.orientation,
      defaultFont: validated.defaultFont,
      marginTopCm: validated.marginTopCm,
      marginBottomCm: validated.marginBottomCm,
      marginLeftCm: validated.marginLeftCm,
      marginRightCm: validated.marginRightCm,
    });

    workspaceState.createDocumentHandle(resolvedPath, builder);
    await builder.saveToFile(resolvedPath);

    return createSuccessEnvelope(
      `Successfully created Arabic MS Word document '${validated.filePath}'`,
      {
        filePath: resolvedPath,
        pageSize: validated.pageSize,
        orientation: validated.orientation,
        defaultFont: validated.defaultFont,
      },
      [{ label: 'Generated Docx File', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }],
      [`Use 'add_paragraph_to_document' or 'add_heading_to_document' to populate content.`]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to create document: ${msg}`);
    return createErrorEnvelope(`Error creating document: ${msg}`) as StandardResultEnvelope<CreateDocumentOutput>;
  }
}
