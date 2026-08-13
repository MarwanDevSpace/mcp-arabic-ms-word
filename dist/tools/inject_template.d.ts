import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const injectTemplateSchema: z.ZodObject<{
    templatePath: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    outputPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    outputPath: string;
    templatePath: string;
    data: Record<string, unknown>;
}, {
    outputPath: string;
    templatePath: string;
    data: Record<string, unknown>;
}>;
export type InjectTemplateInput = z.input<typeof injectTemplateSchema>;
export declare function handleInjectTemplate(input: InjectTemplateInput): Promise<StandardResultEnvelope>;
//# sourceMappingURL=inject_template.d.ts.map