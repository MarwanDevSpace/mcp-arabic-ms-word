import { z } from 'zod';
import { TextRepairResult } from '../domain/text_repair_engine.js';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const repairTextSchema: z.ZodObject<{
    text: z.ZodString;
    normalizeAlef: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    normalizeYeh: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    standardizeDigits: z.ZodDefault<z.ZodOptional<z.ZodEnum<["eastern", "western", "none"]>>>;
    fixInvertedPunctuation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    trimExtraSpaces: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    removeKashida: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    text: string;
    normalizeAlef: boolean;
    normalizeYeh: boolean;
    standardizeDigits: "none" | "eastern" | "western";
    fixInvertedPunctuation: boolean;
    trimExtraSpaces: boolean;
    removeKashida: boolean;
}, {
    text: string;
    normalizeAlef?: boolean | undefined;
    normalizeYeh?: boolean | undefined;
    standardizeDigits?: "none" | "eastern" | "western" | undefined;
    fixInvertedPunctuation?: boolean | undefined;
    trimExtraSpaces?: boolean | undefined;
    removeKashida?: boolean | undefined;
}>;
export type RepairTextInput = z.input<typeof repairTextSchema>;
export declare function handleRepairText(input: RepairTextInput): Promise<StandardResultEnvelope<TextRepairResult>>;
//# sourceMappingURL=repair_text.d.ts.map