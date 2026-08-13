"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocumentSchema = void 0;
exports.handleCreateDocument = handleCreateDocument;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const docx_builder_js_1 = require("../domain/docx_builder.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.createDocumentSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Output .docx file path relative to workspace or absolute'),
    title: zod_1.z.string().optional().describe('Document title metadata'),
    author: zod_1.z.string().optional().describe('Document author metadata'),
    subject: zod_1.z.string().optional().describe('Document subject metadata'),
    pageSize: zod_1.z.enum(['A4', 'Letter', 'A3']).optional().default('A4').describe('Paper size'),
    orientation: zod_1.z.enum(['portrait', 'landscape']).optional().default('portrait').describe('Page orientation'),
    defaultFont: zod_1.z.string().optional().default('Amiri').describe('Default Arabic font family'),
    marginTopCm: zod_1.z.number().optional().default(2.54).describe('Top margin in centimeters'),
    marginBottomCm: zod_1.z.number().optional().default(2.54).describe('Bottom margin in centimeters'),
    marginLeftCm: zod_1.z.number().optional().default(2.54).describe('Left margin in centimeters'),
    marginRightCm: zod_1.z.number().optional().default(2.54).describe('Right margin in centimeters'),
});
async function handleCreateDocument(input) {
    try {
        const validated = exports.createDocumentSchema.parse(input);
        const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        logger_js_1.Logger.info(`Creating new Arabic DOCX document at '${resolvedPath}'`);
        const builder = new docx_builder_js_1.ArabicDocxBuilder({
            title: validated.title,
            author: validated.author,
            subject: validated.subject,
            pageSize: validated.pageSize,
            orientation: validated.orientation,
            defaultFont: validated.defaultFont,
            marginTopCm: validated.marginTopCm,
            marginBottomCm: validated.marginBottomCm,
            marginLeftCm: validated.marginLeftCm,
            marginRightCm: validated.marginRightCm,
        });
        workspace_state_js_1.workspaceState.createDocumentHandle(resolvedPath, builder);
        await builder.saveToFile(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Successfully created Arabic MS Word document '${validated.filePath}'`, {
            filePath: resolvedPath,
            pageSize: validated.pageSize,
            orientation: validated.orientation,
            defaultFont: validated.defaultFont,
        }, [{ label: 'Generated Docx File', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }], [`Use 'add_paragraph_to_document' or 'add_heading_to_document' to populate content.`]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to create document: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error creating document: ${msg}`);
    }
}
//# sourceMappingURL=create_document.js.map