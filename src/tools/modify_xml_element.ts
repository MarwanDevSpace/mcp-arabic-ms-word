import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicXmlEngine } from '../domain/xml_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const modifyXmlElementSchema = z.object({
  filePath: z.string().describe('Path to the .docx file'),
  targetText: z.string().describe('Target text or XML string to replace in document.xml'),
  replacementText: z.string().describe('New replacement text or XML payload'),
  outputPath: z.string().optional().describe('Optional output path. If omitted, overwrites input file'),
});

export type ModifyXmlElementInput = z.input<typeof modifyXmlElementSchema>;

export async function handleModifyXmlElement(
  input: ModifyXmlElementInput
): Promise<StandardResultEnvelope> {
  try {
    const validated = modifyXmlElementSchema.parse(input);
    const resolvedInputPath = resolveWorkspacePath(validated.filePath);
    const resolvedOutputPath = validated.outputPath
      ? resolveWorkspacePath(validated.outputPath)
      : resolvedInputPath;

    Logger.info(`Replacing XML text in '${resolvedInputPath}'`);

    const xmlEngine = new ArabicXmlEngine();
    const finalPath = await xmlEngine.replaceTextInXml(
      resolvedInputPath,
      validated.targetText,
      validated.replacementText,
      resolvedOutputPath
    );

    return createSuccessEnvelope(
      `Replaced text in WordprocessingML XML successfully`,
      {
        inputPath: resolvedInputPath,
        outputPath: finalPath,
        targetText: validated.targetText,
      },
      [{ label: 'Modified Docx', uri: `file:///${finalPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to modify XML: ${msg}`);
    return createErrorEnvelope(`Error modifying XML: ${msg}`);
  }
}
