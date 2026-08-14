import { z } from 'zod';
import { DocumentPageAuditResult } from '../domain/page_renderer.js';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const auditAndRenderPagesSchema: z.ZodObject<{
    document_path: z.ZodString;
    output_folder_name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    dpi: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    detect_layout_defects: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    document_path: string;
    dpi: number;
    output_folder_name: string;
    detect_layout_defects: boolean;
}, {
    document_path: string;
    dpi?: number | undefined;
    output_folder_name?: string | undefined;
    detect_layout_defects?: boolean | undefined;
}>;
export type AuditAndRenderPagesInput = z.input<typeof auditAndRenderPagesSchema>;
export declare function handleAuditAndRenderPages(input: AuditAndRenderPagesInput): Promise<StandardResultEnvelope<DocumentPageAuditResult>>;
//# sourceMappingURL=audit_and_render_pages.d.ts.map