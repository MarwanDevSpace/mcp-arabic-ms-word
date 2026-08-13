import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { ArabicTemplateEngine } from '../domain/template_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const injectTemplateSchema = z.object({
  templatePath: z.string().describe('Path to input .docx template file containing tags like {name}, {#items}'),
  data: z.record(z.unknown()).describe('JSON object containing key-value data to inject into placeholders'),
  outputPath: z.string().describe('Output .docx file path'),
});

export type InjectTemplateInput = z.input<typeof injectTemplateSchema>;

export async function handleInjectTemplate(
  input: InjectTemplateInput
): Promise<StandardResultEnvelope> {
  try {
    const validated = injectTemplateSchema.parse(input);
    const resolvedTemplatePath = resolveWorkspacePath(validated.templatePath);
    const resolvedOutputPath = resolveWorkspacePath(validated.outputPath);

    Logger.info(`Rendering docx template from '${resolvedTemplatePath}' to '${resolvedOutputPath}'`);

    const finalPath = ArabicTemplateEngine.injectData(
      resolvedTemplatePath,
      validated.data,
      resolvedOutputPath
    );

    return createSuccessEnvelope(
      `Successfully injected template data into '${validated.outputPath}'`,
      {
        templatePath: resolvedTemplatePath,
        outputPath: finalPath,
        injectedKeys: Object.keys(validated.data),
      },
      [{ label: 'Generated Docx', uri: `file:///${finalPath.replace(/\\/g, '/')}` }]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to inject template data: ${msg}`);
    return createErrorEnvelope(`Error injecting template data: ${msg}`);
  }
}
