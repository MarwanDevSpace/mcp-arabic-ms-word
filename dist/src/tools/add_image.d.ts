import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const addImageSchema: z.ZodObject<{
    filePath: z.ZodString;
    imagePath: z.ZodString;
    widthPx: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    heightPx: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    align: z.ZodDefault<z.ZodOptional<z.ZodEnum<["right", "center", "left"]>>>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    imagePath: string;
    widthPx: number;
    heightPx: number;
    align: "right" | "left" | "center";
}, {
    filePath: string;
    imagePath: string;
    widthPx?: number | undefined;
    heightPx?: number | undefined;
    align?: "right" | "left" | "center" | undefined;
}>;
export type AddImageInput = z.input<typeof addImageSchema>;
export interface AddImageOutput {
    docPath: string;
    imgPath: string;
    widthPx: number;
    heightPx: number;
}
export declare function handleAddImage(input: AddImageInput): Promise<StandardResultEnvelope<AddImageOutput>>;
//# sourceMappingURL=add_image.d.ts.map