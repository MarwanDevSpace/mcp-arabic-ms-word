"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveIntentSchema = void 0;
exports.handleResolveIntent = handleResolveIntent;
const zod_1 = require("zod");
const intent_resolver_js_1 = require("../domain/intent_resolver.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.resolveIntentSchema = zod_1.z.object({
    prompt: zod_1.z.string().describe('Natural language user request describing the desired Arabic document (e.g. "أنشئ لي خطاب رسمي موجه لوزارة التربية...")'),
    outputPath: zod_1.z.string().optional().describe('Target .docx file path'),
    recipient: zod_1.z.string().optional().describe('Recipient name or title for letters'),
    subject: zod_1.z.string().optional().describe('Document title or subject'),
    author: zod_1.z.string().optional().describe('Document author'),
    fontFamily: zod_1.z.string().optional().describe('Preferred Arabic font family'),
});
async function handleResolveIntent(input) {
    try {
        const validated = exports.resolveIntentSchema.parse(input);
        logger_js_1.Logger.info(`Resolving intent for prompt: '${validated.prompt}'`);
        const result = await (0, intent_resolver_js_1.resolveAndExecuteIntent)({
            prompt: validated.prompt,
            outputPath: validated.outputPath,
            recipient: validated.recipient,
            subject: validated.subject,
            author: validated.author,
            fontFamily: validated.fontFamily,
        });
        return (0, index_js_1.createSuccessEnvelope)(`Automatically generated complete Arabic Word document (${result.archetype})`, result, [{ label: 'Generated Docx Document', uri: `file:///${result.outputPath.replace(/\\/g, '/')}` }], [`Use 'inspect_word_document' or 'convert_word_to_markdown' to review contents.`]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to resolve intent: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error resolving intent: ${msg}`);
    }
}
//# sourceMappingURL=resolve_intent.js.map