import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const addParagraphSchema: z.ZodObject<{
    filePath: z.ZodString;
    text: z.ZodString;
    fontFamily: z.ZodOptional<z.ZodString>;
    fontSizePt: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<["rtl", "ltr"]>>>;
    alignment: z.ZodDefault<z.ZodOptional<z.ZodEnum<["right", "left", "center", "justify", "kashida"]>>>;
    lineSpacingMultiplier: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    spaceBeforePt: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    spaceAfterPt: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    colorHex: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    bold: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    italic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    underline: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    fontSizePt: number;
    direction: "rtl" | "ltr";
    alignment: "right" | "left" | "center" | "justify" | "kashida";
    lineSpacingMultiplier: number;
    spaceBeforePt: number;
    spaceAfterPt: number;
    colorHex: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    text: string;
    filePath: string;
    fontFamily?: string | undefined;
}, {
    text: string;
    filePath: string;
    fontFamily?: string | undefined;
    fontSizePt?: number | undefined;
    direction?: "rtl" | "ltr" | undefined;
    alignment?: "right" | "left" | "center" | "justify" | "kashida" | undefined;
    lineSpacingMultiplier?: number | undefined;
    spaceBeforePt?: number | undefined;
    spaceAfterPt?: number | undefined;
    colorHex?: string | undefined;
    bold?: boolean | undefined;
    italic?: boolean | undefined;
    underline?: boolean | undefined;
}>;
export type AddParagraphInput = z.input<typeof addParagraphSchema>;
export declare function handleAddParagraph(input: AddParagraphInput): Promise<StandardResultEnvelope>;
//# sourceMappingURL=add_paragraph.d.ts.map