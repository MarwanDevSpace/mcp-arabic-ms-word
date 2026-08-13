import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicXmlEngine, DocumentInspectionResult } from '../domain/xml_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const inspectDocumentSchema = z.object({
  filePath: z.string().describe('Path to the .docx file to inspect'),
});

export type InspectDocumentInput = z.input<typeof inspectDocumentSchema>;

export async function handleInspectDocument(
  input: InspectDocumentInput
): Promise<StandardResultEnvelope<DocumentInspectionResult>> {
  try {
    const validated = inspectDocumentSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    Logger.info(`Inspecting DOCX document at '${resolvedPath}'`);

    const xmlEngine = new ArabicXmlEngine();
    const result = await xmlEngine.inspectDocx(resolvedPath);

    return createSuccessEnvelope(
      `Inspection complete for document '${validated.filePath}'`,
      result,
      [{ label: 'Inspected File', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }],
      [`Use 'convert_word_to_markdown' for full text contents extraction.`]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to inspect document: ${msg}`);
    return createErrorEnvelope(`Error inspecting document: ${msg}`) as StandardResultEnvelope<DocumentInspectionResult>;
  }
}
