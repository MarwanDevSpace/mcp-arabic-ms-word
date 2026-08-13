"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToMarkdownSchema = void 0;
exports.handleConvertToMarkdown = handleConvertToMarkdown;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const xml_engine_js_1 = require("../domain/xml_engine.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.convertToMarkdownSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to the .docx file to convert'),
});
async function handleConvertToMarkdown(input) {
    try {
        const validated = exports.convertToMarkdownSchema.parse(input);
        const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        logger_js_1.Logger.info(`Converting DOCX to Markdown for '${resolvedPath}'`);
        const xmlEngine = new xml_engine_js_1.ArabicXmlEngine();
        const markdownText = await xmlEngine.convertToMarkdown(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Extracted Markdown content from '${validated.filePath}'`, {
            filePath: resolvedPath,
            markdown: markdownText,
            characterCount: markdownText.length,
        }, [{ label: 'Original Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to convert document to markdown: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error converting document to markdown: ${msg}`);
    }
}
//# sourceMappingURL=convert_to_markdown.js.map