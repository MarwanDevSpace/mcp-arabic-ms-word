"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyXmlElementSchema = void 0;
exports.handleModifyXmlElement = handleModifyXmlElement;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const xml_engine_js_1 = require("../domain/xml_engine.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.modifyXmlElementSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to the .docx file'),
    targetText: zod_1.z.string().describe('Target text or XML string to replace in document.xml'),
    replacementText: zod_1.z.string().describe('New replacement text or XML payload'),
    outputPath: zod_1.z.string().optional().describe('Optional output path. If omitted, overwrites input file'),
});
async function handleModifyXmlElement(input) {
    try {
        const validated = exports.modifyXmlElementSchema.parse(input);
        const resolvedInputPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        const resolvedOutputPath = validated.outputPath
            ? (0, workspace_js_1.resolveWorkspacePath)(validated.outputPath)
            : resolvedInputPath;
        logger_js_1.Logger.info(`Replacing XML text in '${resolvedInputPath}'`);
        const xmlEngine = new xml_engine_js_1.ArabicXmlEngine();
        const finalPath = await xmlEngine.replaceTextInXml(resolvedInputPath, validated.targetText, validated.replacementText, resolvedOutputPath);
        return (0, index_js_1.createSuccessEnvelope)(`Replaced text in WordprocessingML XML successfully`, {
            inputPath: resolvedInputPath,
            outputPath: finalPath,
            targetText: validated.targetText,
        }, [{ label: 'Modified Docx', uri: `file:///${finalPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to modify XML: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error modifying XML: ${msg}`);
    }
}
//# sourceMappingURL=modify_xml_element.js.map