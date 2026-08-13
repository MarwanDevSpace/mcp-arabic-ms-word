import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const convertToMarkdownSchema: z.ZodObject<{
    filePath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filePath: string;
}, {
    filePath: string;
}>;
export type ConvertToMarkdownInput = z.input<typeof convertToMarkdownSchema>;
export interface ConvertToMarkdownOutput {
    filePath: string;
    markdown: string;
    characterCount: number;
}
export declare function handleConvertToMarkdown(input: ConvertToMarkdownInput): Promise<StandardResultEnvelope<ConvertToMarkdownOutput>>;
//# sourceMappingURL=convert_to_markdown.d.ts.map