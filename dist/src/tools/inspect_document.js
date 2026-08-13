"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectDocumentSchema = void 0;
exports.handleInspectDocument = handleInspectDocument;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const xml_engine_js_1 = require("../domain/xml_engine.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.inspectDocumentSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to the .docx file to inspect'),
});
async function handleInspectDocument(input) {
    try {
        const validated = exports.inspectDocumentSchema.parse(input);
        const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        logger_js_1.Logger.info(`Inspecting DOCX document at '${resolvedPath}'`);
        const xmlEngine = new xml_engine_js_1.ArabicXmlEngine();
        const result = await xmlEngine.inspectDocx(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Inspection complete for document '${validated.filePath}'`, result, [{ label: 'Inspected File', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }], [`Use 'convert_word_to_markdown' for full text contents extraction.`]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to inspect document: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error inspecting document: ${msg}`);
    }
}
//# sourceMappingURL=inspect_document.js.map