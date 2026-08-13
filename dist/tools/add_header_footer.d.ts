import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const addHeaderFooterSchema: z.ZodObject<{
    filePath: z.ZodString;
    headerText: z.ZodOptional<z.ZodString>;
    footerText: z.ZodOptional<z.ZodString>;
    includePageNumbers: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    isRtl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    isRtl: boolean;
    includePageNumbers: boolean;
    headerText?: string | undefined;
    footerText?: string | undefined;
}, {
    filePath: string;
    isRtl?: boolean | undefined;
    headerText?: string | undefined;
    footerText?: string | undefined;
    includePageNumbers?: boolean | undefined;
}>;
export type AddHeaderFooterInput = z.input<typeof addHeaderFooterSchema>;
export declare function handleAddHeaderFooter(input: AddHeaderFooterInput): Promise<StandardResultEnvelope>;
//# sourceMappingURL=add_header_footer.d.ts.map