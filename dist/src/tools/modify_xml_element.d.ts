import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const modifyXmlElementSchema: z.ZodObject<{
    filePath: z.ZodString;
    targetText: z.ZodString;
    replacementText: z.ZodString;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    targetText: string;
    replacementText: string;
    outputPath?: string | undefined;
}, {
    filePath: string;
    targetText: string;
    replacementText: string;
    outputPath?: string | undefined;
}>;
export type ModifyXmlElementInput = z.input<typeof modifyXmlElementSchema>;
export interface ModifyXmlElementOutput {
    inputPath: string;
    outputPath: string;
    targetText: string;
}
export declare function handleModifyXmlElement(input: ModifyXmlElementInput): Promise<StandardResultEnvelope<ModifyXmlElementOutput>>;
//# sourceMappingURL=modify_xml_element.d.ts.map