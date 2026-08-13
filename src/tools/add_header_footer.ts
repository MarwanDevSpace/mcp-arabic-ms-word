import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addHeaderFooterSchema = z.object({
  filePath: z.string().describe('Path to the .docx file'),
  headerText: z.string().optional().describe('Text to place in document header'),
  footerText: z.string().optional().describe('Text to place in document footer'),
  includePageNumbers: z.boolean().optional().default(true).describe('Include page numbers in footer'),
  isRtl: z.boolean().optional().default(true).describe('RTL direction'),
});

export type AddHeaderFooterInput = z.input<typeof addHeaderFooterSchema>;

export async function handleAddHeaderFooter(
  input: AddHeaderFooterInput
): Promise<StandardResultEnvelope> {
  try {
    const validated = addHeaderFooterSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    let handle = workspaceState.getDocumentHandle(resolvedPath);
    let builder: ArabicDocxBuilder;

    if (handle) {
      builder = handle.builder;
    } else {
      builder = new ArabicDocxBuilder();
      workspaceState.createDocumentHandle(resolvedPath, builder);
    }

    if (validated.headerText) {
      builder.addHeader(validated.headerText, validated.isRtl);
    }
    if (validated.footerText || validated.includePageNumbers) {
      builder.addFooter(validated.footerText || '', validated.includePageNumbers, validated.isRtl);
    }

    await builder.saveToFile(resolvedPath);

    return createSuccessEnvelope(
      `Updated header/footer for '${validated.filePath}'`,
      {
        filePath: resolvedPath,
        headerText: validated.headerText,
        footerText: validated.footerText,
        includePageNumbers: validated.includePageNumbers,
      },
      [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to update header/footer: ${msg}`);
    return createErrorEnvelope(`Error updating header/footer: ${msg}`);
  }
}
