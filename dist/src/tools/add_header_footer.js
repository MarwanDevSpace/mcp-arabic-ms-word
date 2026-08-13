"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHeaderFooterSchema = void 0;
exports.handleAddHeaderFooter = handleAddHeaderFooter;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const docx_builder_js_1 = require("../domain/docx_builder.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.addHeaderFooterSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to the .docx file'),
    headerText: zod_1.z.string().optional().describe('Text to place in document header'),
    footerText: zod_1.z.string().optional().describe('Text to place in document footer'),
    includePageNumbers: zod_1.z.boolean().optional().default(true).describe('Include page numbers in footer'),
    isRtl: zod_1.z.boolean().optional().default(true).describe('RTL direction'),
});
async function handleAddHeaderFooter(input) {
    try {
        const validated = exports.addHeaderFooterSchema.parse(input);
        const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        let handle = workspace_state_js_1.workspaceState.getDocumentHandle(resolvedPath);
        let builder;
        if (handle) {
            builder = handle.builder;
        }
        else {
            builder = new docx_builder_js_1.ArabicDocxBuilder();
            workspace_state_js_1.workspaceState.createDocumentHandle(resolvedPath, builder);
        }
        if (validated.headerText) {
            builder.addHeader(validated.headerText, validated.isRtl);
        }
        if (validated.footerText || validated.includePageNumbers) {
            builder.addFooter(validated.footerText || '', validated.includePageNumbers, validated.isRtl);
        }
        await builder.saveToFile(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Updated header/footer for '${validated.filePath}'`, {
            filePath: resolvedPath,
            headerText: validated.headerText,
            footerText: validated.footerText,
            includePageNumbers: validated.includePageNumbers,
        }, [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to update header/footer: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error updating header/footer: ${msg}`);
    }
}
//# sourceMappingURL=add_header_footer.js.map