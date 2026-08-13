import { z } from 'zod';
import { ArabicTextRepairEngine, TextRepairResult } from '../domain/text_repair_engine.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const repairTextSchema = z.object({
  text: z.string().describe('Arabic text string to inspect and repair'),
  normalizeAlef: z.boolean().optional().default(false).describe('Normalize Alef forms (أ, إ, آ -> ا)'),
  normalizeYeh: z.boolean().optional().default(false).describe('Normalize Dotless Yeh (ى -> ي)'),
  standardizeDigits: z.enum(['eastern', 'western', 'none']).optional().default('none').describe('Convert numbers to Eastern (٠-٩) or Western (0-9)'),
  fixInvertedPunctuation: z.boolean().optional().default(true).describe('Fix inverted parentheses and punctuation spacing'),
  trimExtraSpaces: z.boolean().optional().default(true).describe('Trim redundant spaces and blank tabs'),
  removeKashida: z.boolean().optional().default(false).describe('Strip kashida (tatweel) characters'),
});

export type RepairTextInput = z.input<typeof repairTextSchema>;

export async function handleRepairText(
  input: RepairTextInput
): Promise<StandardResultEnvelope<TextRepairResult>> {
  try {
    const validated = repairTextSchema.parse(input);
    Logger.info(`Repairing Arabic text formatting (length: ${validated.text.length})`);

    const result = ArabicTextRepairEngine.repairText(validated.text, {
      normalizeAlef: validated.normalizeAlef,
      normalizeYeh: validated.normalizeYeh,
      standardizeDigits: validated.standardizeDigits,
      fixInvertedPunctuation: validated.fixInvertedPunctuation,
      trimExtraSpaces: validated.trimExtraSpaces,
      removeKashida: validated.removeKashida,
    });

    return createSuccessEnvelope(
      `Arabic text repair complete (${result.transformationsApplied.length} fixes applied)`,
      result
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to repair text: ${msg}`);
    return createErrorEnvelope(`Error repairing text: ${msg}`) as StandardResultEnvelope<TextRepairResult>;
  }
}
