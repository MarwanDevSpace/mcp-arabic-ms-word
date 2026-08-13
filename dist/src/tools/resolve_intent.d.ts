import { z } from 'zod';
import { AutomatedIntentResult } from '../domain/intent_resolver.js';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const resolveIntentSchema: z.ZodObject<{
    prompt: z.ZodString;
    outputPath: z.ZodOptional<z.ZodString>;
    recipient: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    fontFamily: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    fontFamily?: string | undefined;
    author?: string | undefined;
    subject?: string | undefined;
    outputPath?: string | undefined;
    recipient?: string | undefined;
}, {
    prompt: string;
    fontFamily?: string | undefined;
    author?: string | undefined;
    subject?: string | undefined;
    outputPath?: string | undefined;
    recipient?: string | undefined;
}>;
export type ResolveIntentInput = z.input<typeof resolveIntentSchema>;
export declare function handleResolveIntent(input: ResolveIntentInput): Promise<StandardResultEnvelope<AutomatedIntentResult>>;
//# sourceMappingURL=resolve_intent.d.ts.map