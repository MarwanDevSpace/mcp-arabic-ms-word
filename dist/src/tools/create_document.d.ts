import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const createDocumentSchema: z.ZodObject<{
    filePath: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    pageSize: z.ZodDefault<z.ZodOptional<z.ZodEnum<["A4", "Letter", "A3"]>>>;
    orientation: z.ZodDefault<z.ZodOptional<z.ZodEnum<["portrait", "landscape"]>>>;
    defaultFont: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    marginTopCm: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    marginBottomCm: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    marginLeftCm: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    marginRightCm: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    orientation: "portrait" | "landscape";
    filePath: string;
    pageSize: "A4" | "Letter" | "A3";
    defaultFont: string;
    marginTopCm: number;
    marginBottomCm: number;
    marginLeftCm: number;
    marginRightCm: number;
    title?: string | undefined;
    author?: string | undefined;
    subject?: string | undefined;
}, {
    filePath: string;
    orientation?: "portrait" | "landscape" | undefined;
    title?: string | undefined;
    author?: string | undefined;
    subject?: string | undefined;
    pageSize?: "A4" | "Letter" | "A3" | undefined;
    defaultFont?: string | undefined;
    marginTopCm?: number | undefined;
    marginBottomCm?: number | undefined;
    marginLeftCm?: number | undefined;
    marginRightCm?: number | undefined;
}>;
export type CreateDocumentInput = z.input<typeof createDocumentSchema>;
export interface CreateDocumentOutput {
    filePath: string;
    pageSize: string;
    orientation: string;
    defaultFont: string;
}
export declare function handleCreateDocument(input: CreateDocumentInput): Promise<StandardResultEnvelope<CreateDocumentOutput>>;
//# sourceMappingURL=create_document.d.ts.map