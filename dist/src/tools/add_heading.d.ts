import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const addHeadingSchema: z.ZodObject<{
    filePath: z.ZodString;
    text: z.ZodString;
    level: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    fontFamily: z.ZodOptional<z.ZodString>;
    fontSizePt: z.ZodOptional<z.ZodNumber>;
    colorHex: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    alignment: z.ZodDefault<z.ZodOptional<z.ZodEnum<["right", "left", "center", "justify"]>>>;
    direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<["rtl", "ltr"]>>>;
}, "strip", z.ZodTypeAny, {
    direction: "rtl" | "ltr";
    alignment: "right" | "left" | "center" | "justify";
    colorHex: string;
    text: string;
    filePath: string;
    level: number;
    fontFamily?: string | undefined;
    fontSizePt?: number | undefined;
}, {
    text: string;
    filePath: string;
    fontFamily?: string | undefined;
    fontSizePt?: number | undefined;
    direction?: "rtl" | "ltr" | undefined;
    alignment?: "right" | "left" | "center" | "justify" | undefined;
    colorHex?: string | undefined;
    level?: number | undefined;
}>;
export type AddHeadingInput = z.input<typeof addHeadingSchema>;
export interface AddHeadingOutput {
    filePath: string;
    headingText: string;
    level: number;
}
export declare function handleAddHeading(input: AddHeadingInput): Promise<StandardResultEnvelope<AddHeadingOutput>>;
//# sourceMappingURL=add_heading.d.ts.map