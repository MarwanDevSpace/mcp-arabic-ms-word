"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompressXmlSchema = void 0;
exports.handleDecompressXml = handleDecompressXml;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const xml_engine_js_1 = require("../domain/xml_engine.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.decompressXmlSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to the .docx archive file'),
    targetXmlPath: zod_1.z.string().optional().default('word/document.xml').describe('Path inside docx archive (e.g. word/document.xml, word/styles.xml, word/numbering.xml)'),
    searchPattern: zod_1.z.string().describe('Regex pattern or string to search inside target XML'),
    replacementValue: zod_1.z.string().describe('Replacement string or XML payload to inject'),
    outputPath: zod_1.z.string().optional().describe('Optional output .docx path. Overwrites input if omitted'),
});
async function handleDecompressXml(input) {
    try {
        const validated = exports.decompressXmlSchema.parse(input);
        const resolvedInputPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        const resolvedOutputPath = validated.outputPath
            ? (0, workspace_js_1.resolveWorkspacePath)(validated.outputPath)
            : resolvedInputPath;
        logger_js_1.Logger.info(`Decompressing and modifying XML file '${validated.targetXmlPath}' inside '${resolvedInputPath}'`);
        const xmlEngine = new xml_engine_js_1.ArabicXmlEngine();
        const result = await xmlEngine.decompressAndModifyXmlFile(resolvedInputPath, validated.targetXmlPath, validated.searchPattern, validated.replacementValue, resolvedOutputPath);
        return (0, index_js_1.createSuccessEnvelope)(`Decompressed and modified ${result.matchCount} XML occurrence(s) in '${result.modifiedXmlPath}'`, result, [{ label: 'Updated Docx Archive', uri: `file:///${result.outputPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to decompress and modify XML: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error decompressing XML: ${msg}`);
    }
}
//# sourceMappingURL=decompress_xml.js.map