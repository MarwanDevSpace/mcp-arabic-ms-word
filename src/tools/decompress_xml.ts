import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicXmlEngine } from '../domain/xml_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const decompressXmlSchema = z.object({
  filePath: z.string().describe('Path to the .docx archive file'),
  targetXmlPath: z.string().optional().default('word/document.xml').describe('Path inside docx archive (e.g. word/document.xml, word/styles.xml, word/numbering.xml)'),
  searchPattern: z.string().describe('Regex pattern or string to search inside target XML'),
  replacementValue: z.string().describe('Replacement string or XML payload to inject'),
  outputPath: z.string().optional().describe('Optional output .docx path. Overwrites input if omitted'),
});

export type DecompressXmlInput = z.input<typeof decompressXmlSchema>;

export interface DecompressXmlOutput {
  outputPath: string;
  modifiedXmlPath: string;
  matchCount: number;
}

export async function handleDecompressXml(
  input: DecompressXmlInput
): Promise<StandardResultEnvelope<DecompressXmlOutput>> {
  try {
    const validated = decompressXmlSchema.parse(input);
    const resolvedInputPath = resolveWorkspacePath(validated.filePath);
    const resolvedOutputPath = validated.outputPath
      ? resolveWorkspacePath(validated.outputPath)
      : resolvedInputPath;

    Logger.info(`Decompressing and modifying XML file '${validated.targetXmlPath}' inside '${resolvedInputPath}'`);

    const xmlEngine = new ArabicXmlEngine();
    const result = await xmlEngine.decompressAndModifyXmlFile(
      resolvedInputPath,
      validated.targetXmlPath,
      validated.searchPattern,
      validated.replacementValue,
      resolvedOutputPath
    );

    return createSuccessEnvelope(
      `Decompressed and modified ${result.matchCount} XML occurrence(s) in '${result.modifiedXmlPath}'`,
      result,
      [{ label: 'Updated Docx Archive', uri: `file:///${result.outputPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to decompress and modify XML: ${msg}`);
    return createErrorEnvelope(`Error decompressing XML: ${msg}`) as StandardResultEnvelope<DecompressXmlOutput>;
  }
}
