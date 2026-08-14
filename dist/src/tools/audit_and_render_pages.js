"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAndRenderPagesSchema = void 0;
exports.handleAuditAndRenderPages = handleAuditAndRenderPages;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const page_renderer_js_1 = require("../domain/page_renderer.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.auditAndRenderPagesSchema = zod_1.z.object({
    document_path: zod_1.z.string().describe('Absolute or workspace path to the Word document (.docx)'),
    output_folder_name: zod_1.z
        .string()
        .optional()
        .default('Pages')
        .describe('Name of the subfolder inside the workspace to store rendered page images (default: "Pages")'),
    dpi: zod_1.z
        .number()
        .int()
        .optional()
        .default(150)
        .describe('Image rendering resolution in DPI (150 for fast visual audit, 300 for publication quality)'),
    detect_layout_defects: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('Automatically inspect line counts and bounding boxes to flag orphan headings, split verses, and overflowing trailing lines'),
});
async function handleAuditAndRenderPages(input) {
    try {
        const validated = exports.auditAndRenderPagesSchema.parse(input);
        const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(validated.document_path);
        logger_js_1.Logger.info(`Auditing and rendering pages for '${resolvedPath}'`);
        const renderer = new page_renderer_js_1.DocumentPageRenderer();
        const result = await renderer.auditAndRenderPages(resolvedPath, {
            outputFolderName: validated.output_folder_name,
            dpi: validated.dpi,
            detectLayoutDefects: validated.detect_layout_defects,
        });
        const artifacts = result.renderedPages.map((page) => ({
            label: `Page ${page.pageNumber}`,
            uri: page.uri,
        }));
        if (result.pdfPath) {
            artifacts.unshift({
                label: 'Generated PDF Document',
                uri: `file:///${result.pdfPath.replace(/\\/g, '/')}`,
            });
        }
        return (0, index_js_1.createSuccessEnvelope)(`Audited & rendered ${result.pageCount} page(s) into '${result.pagesDirectory}' (Integrity Score: ${result.diagnostics.layoutIntegrityScore}%)`, result, artifacts, result.diagnostics.recommendations);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to audit and render pages: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error auditing and rendering pages: ${msg}`);
    }
}
//# sourceMappingURL=audit_and_render_pages.js.map