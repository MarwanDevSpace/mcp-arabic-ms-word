import { z } from 'zod';
import { resolveAndExecuteIntent, AutomatedIntentResult } from '../domain/intent_resolver.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const resolveIntentSchema = z.object({
  prompt: z.string().describe('Natural language user request describing the desired Arabic document (e.g. "أنشئ لي خطاب رسمي موجه لوزارة التربية...")'),
  outputPath: z.string().optional().describe('Target .docx file path'),
  recipient: z.string().optional().describe('Recipient name or title for letters'),
  subject: z.string().optional().describe('Document title or subject'),
  author: z.string().optional().describe('Document author'),
  fontFamily: z.string().optional().describe('Preferred Arabic font family'),
});

export type ResolveIntentInput = z.input<typeof resolveIntentSchema>;

export async function handleResolveIntent(
  input: ResolveIntentInput
): Promise<StandardResultEnvelope<AutomatedIntentResult>> {
  try {
    const validated = resolveIntentSchema.parse(input);
    Logger.info(`Resolving intent for prompt: '${validated.prompt}'`);

    const result = await resolveAndExecuteIntent({
      prompt: validated.prompt,
      outputPath: validated.outputPath,
      recipient: validated.recipient,
      subject: validated.subject,
      author: validated.author,
      fontFamily: validated.fontFamily,
    });

    return createSuccessEnvelope(
      `Automatically generated complete Arabic Word document (${result.archetype})`,
      result,
      [{ label: 'Generated Docx Document', uri: `file:///${result.outputPath.replace(/\\/g, '/')}` }],
      [`Use 'inspect_word_document' or 'convert_word_to_markdown' to review contents.`]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to resolve intent: ${msg}`);
    return createErrorEnvelope(`Error resolving intent: ${msg}`) as StandardResultEnvelope<AutomatedIntentResult>;
  }
}
