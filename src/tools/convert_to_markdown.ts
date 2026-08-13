import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicXmlEngine } from '../domain/xml_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const convertToMarkdownSchema = z.object({
  filePath: z.string().describe('Path to the .docx file to convert'),
});

export type ConvertToMarkdownInput = z.input<typeof convertToMarkdownSchema>;

export interface ConvertToMarkdownOutput {
  filePath: string;
  markdown: string;
  characterCount: number;
}

export async function handleConvertToMarkdown(
  input: ConvertToMarkdownInput
): Promise<StandardResultEnvelope<ConvertToMarkdownOutput>> {
  try {
    const validated = convertToMarkdownSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.filePath);

    Logger.info(`Converting DOCX to Markdown for '${resolvedPath}'`);

    const xmlEngine = new ArabicXmlEngine();
    const markdownText = await xmlEngine.convertToMarkdown(resolvedPath);

    return createSuccessEnvelope(
      `Extracted Markdown content from '${validated.filePath}'`,
      {
        filePath: resolvedPath,
        markdown: markdownText,
        characterCount: markdownText.length,
      },
      [{ label: 'Original Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to convert document to markdown: ${msg}`);
    return createErrorEnvelope(`Error converting document to markdown: ${msg}`) as StandardResultEnvelope<ConvertToMarkdownOutput>;
  }
}
