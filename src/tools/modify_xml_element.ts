import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicXmlEngine } from '../domain/xml_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const modifyXmlElementSchema = z.object({
  filePath: z.string().describe('Path to target .docx file to inspect and modify in-place'),
  targetText: z.string().describe('Exact text string or XML snippet to search for inside word/document.xml'),
  replacementText: z.string().describe('Replacement text string or WordprocessingML XML payload to inject'),
  outputPath: z.string().optional().describe('Optional output .docx file path. If omitted, filePath is modified in-place'),
});

export type ModifyXmlElementInput = z.input<typeof modifyXmlElementSchema>;

export interface ModifyXmlElementOutput {
  inputPath: string;
  outputPath: string;
  targetText: string;
}

export async function handleModifyXmlElement(
  input: ModifyXmlElementInput
): Promise<StandardResultEnvelope<ModifyXmlElementOutput>> {
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
      [{ label: 'Modified Docx', uri: `file:///${finalPath.replace(/\\/g, '/')}` }],
      [`Caution: Verify document rendering integrity if raw XML tags were injected.`]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to modify XML: ${msg}`);
    return createErrorEnvelope(`Error modifying XML: ${msg}`) as StandardResultEnvelope<ModifyXmlElementOutput>;
  }
}
