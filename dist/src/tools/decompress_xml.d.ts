import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const decompressXmlSchema: z.ZodObject<{
    filePath: z.ZodString;
    targetXmlPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    searchPattern: z.ZodString;
    replacementValue: z.ZodString;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    targetXmlPath: string;
    searchPattern: string;
    replacementValue: string;
    outputPath?: string | undefined;
}, {
    filePath: string;
    searchPattern: string;
    replacementValue: string;
    outputPath?: string | undefined;
    targetXmlPath?: string | undefined;
}>;
export type DecompressXmlInput = z.input<typeof decompressXmlSchema>;
export interface DecompressXmlOutput {
    outputPath: string;
    modifiedXmlPath: string;
    matchCount: number;
}
export declare function handleDecompressXml(input: DecompressXmlInput): Promise<StandardResultEnvelope<DecompressXmlOutput>>;
//# sourceMappingURL=decompress_xml.d.ts.map