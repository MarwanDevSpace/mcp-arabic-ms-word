"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectTemplateSchema = void 0;
exports.handleInjectTemplate = handleInjectTemplate;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const template_engine_js_1 = require("../domain/template_engine.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.injectTemplateSchema = zod_1.z.object({
    templatePath: zod_1.z.string().describe('Path to input .docx template file containing tags like {name}, {#items}'),
    data: zod_1.z.record(zod_1.z.unknown()).describe('JSON object containing key-value data to inject into placeholders'),
    outputPath: zod_1.z.string().describe('Output .docx file path'),
});
async function handleInjectTemplate(input) {
    try {
        const validated = exports.injectTemplateSchema.parse(input);
        const resolvedTemplatePath = (0, workspace_js_1.resolveWorkspacePath)(validated.templatePath);
        const resolvedOutputPath = (0, workspace_js_1.resolveWorkspacePath)(validated.outputPath);
        logger_js_1.Logger.info(`Rendering docx template from '${resolvedTemplatePath}' to '${resolvedOutputPath}'`);
        const finalPath = template_engine_js_1.ArabicTemplateEngine.injectData(resolvedTemplatePath, validated.data, resolvedOutputPath);
        return (0, index_js_1.createSuccessEnvelope)(`Successfully injected template data into '${validated.outputPath}'`, {
            templatePath: resolvedTemplatePath,
            outputPath: finalPath,
            injectedKeys: Object.keys(validated.data),
        }, [{ label: 'Generated Docx', uri: `file:///${finalPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to inject template data: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error injecting template data: ${msg}`);
    }
}
//# sourceMappingURL=inject_template.js.map