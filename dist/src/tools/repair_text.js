"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairTextSchema = void 0;
exports.handleRepairText = handleRepairText;
const zod_1 = require("zod");
const text_repair_engine_js_1 = require("../domain/text_repair_engine.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.repairTextSchema = zod_1.z.object({
    text: zod_1.z.string().describe('Arabic text string to inspect and repair'),
    normalizeAlef: zod_1.z.boolean().optional().default(false).describe('Normalize Alef forms (أ, إ, آ -> ا)'),
    normalizeYeh: zod_1.z.boolean().optional().default(false).describe('Normalize Dotless Yeh (ى -> ي)'),
    standardizeDigits: zod_1.z.enum(['eastern', 'western', 'none']).optional().default('none').describe('Convert numbers to Eastern (٠-٩) or Western (0-9)'),
    fixInvertedPunctuation: zod_1.z.boolean().optional().default(true).describe('Fix inverted parentheses and punctuation spacing'),
    trimExtraSpaces: zod_1.z.boolean().optional().default(true).describe('Trim redundant spaces and blank tabs'),
    removeKashida: zod_1.z.boolean().optional().default(false).describe('Strip kashida (tatweel) characters'),
});
async function handleRepairText(input) {
    try {
        const validated = exports.repairTextSchema.parse(input);
        logger_js_1.Logger.info(`Repairing Arabic text formatting (length: ${validated.text.length})`);
        const result = text_repair_engine_js_1.ArabicTextRepairEngine.repairText(validated.text, {
            normalizeAlef: validated.normalizeAlef,
            normalizeYeh: validated.normalizeYeh,
            standardizeDigits: validated.standardizeDigits,
            fixInvertedPunctuation: validated.fixInvertedPunctuation,
            trimExtraSpaces: validated.trimExtraSpaces,
            removeKashida: validated.removeKashida,
        });
        return (0, index_js_1.createSuccessEnvelope)(`Arabic text repair complete (${result.transformationsApplied.length} fixes applied)`, result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to repair text: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error repairing text: ${msg}`);
    }
}
//# sourceMappingURL=repair_text.js.map