import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { workspaceState } from '../state/workspace_state.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const addTableSchema = z.object({
  filePath: z.string().describe('Path to the .docx file'),
  columns: z
    .array(
      z.object({
        header: z.string().describe('Column header text'),
        widthPercent: z.number().optional().describe('Column width percentage (0-100)'),
      })
    )
    .min(1)
    .describe('Array of column header definitions'),
  rows: z
    .array(
      z.object({
        cells: z.array(z.string()).describe('Array of cell values for this row'),
        backgroundColor: z.string().optional().describe('Custom row background hex color'),
      })
    )
    .describe('Array of row data'),
  isRtl: z.boolean().optional().default(true).describe('RTL table direction (w:bidiVisual)'),
});

export type AddTableInput = z.input<typeof addTableSchema>;

export async function handleAddTable(
  input: AddTableInput
): Promise<StandardResultEnvelope> {
  try {
    const validated = addTableSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    let handle = workspaceState.getDocumentHandle(resolvedPath);
    let builder: ArabicDocxBuilder;

    if (handle) {
      builder = handle.builder;
    } else {
      builder = new ArabicDocxBuilder();
      workspaceState.createDocumentHandle(resolvedPath, builder);
    }

    builder.addTable(validated.columns, validated.rows, validated.isRtl);
    await builder.saveToFile(resolvedPath);

    return createSuccessEnvelope(
      `Appended ${validated.columns.length}x${validated.rows.length} table to '${validated.filePath}'`,
      {
        filePath: resolvedPath,
        columnsCount: validated.columns.length,
        rowsCount: validated.rows.length,
        isRtl: validated.isRtl,
      },
      [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to add table: ${msg}`);
    return createErrorEnvelope(`Error adding table: ${msg}`);
  }
}
