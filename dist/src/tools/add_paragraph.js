"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addParagraphSchema = void 0;
exports.handleAddParagraph = handleAddParagraph;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const docx_builder_js_1 = require("../domain/docx_builder.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.addParagraphSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to target .docx file to modify in-place'),
    text: zod_1.z.string().describe('Paragraph text content string'),
    fontFamily: zod_1.z.string().optional().describe('Font family name (e.g. Amiri, Cairo, Traditional Arabic)'),
    fontSizePt: zod_1.z.number().optional().default(14).describe('Font size in points (default 14 pt)'),
    direction: zod_1.z.enum(['rtl', 'ltr']).optional().default('rtl').describe('Text direction (rtl for Right-to-Left Arabic, ltr for English)'),
    alignment: zod_1.z.enum(['right', 'left', 'center', 'justify', 'kashida']).optional().default('right').describe('Text alignment (right, left, center, justify, or kashida for Arabic justification)'),
    lineSpacingMultiplier: zod_1.z.number().optional().default(1.25).describe('Line spacing height multiplier (default 1.25 for Arabic diacritics readability)'),
    spaceBeforePt: zod_1.z.number().optional().default(0).describe('Spacing before paragraph in points'),
    spaceAfterPt: zod_1.z.number().optional().default(6).describe('Spacing after paragraph in points (default 6 pt)'),
    colorHex: zod_1.z.string().optional().default('000000').describe('Six-character hex color code without leading # (default 000000)'),
    bold: zod_1.z.boolean().optional().default(false).describe('Set to true for bold text weight'),
    italic: zod_1.z.boolean().optional().default(false).describe('Set to true for italic style'),
    underline: zod_1.z.boolean().optional().default(false).describe('Set to true for underlined text'),
});
async function handleAddParagraph(input) {
    try {
        const validated = exports.addParagraphSchema.parse(input);
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
        builder.addParagraph(validated.text, {
            fontFamily: validated.fontFamily,
            fontSizePt: validated.fontSizePt,
            direction: validated.direction,
            alignment: validated.alignment,
            lineSpacingMultiplier: validated.lineSpacingMultiplier,
            spaceBeforePt: validated.spaceBeforePt,
            spaceAfterPt: validated.spaceAfterPt,
            colorHex: validated.colorHex,
            bold: validated.bold,
            italic: validated.italic,
            underline: validated.underline,
        });
        await builder.saveToFile(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Appended paragraph to '${validated.filePath}'`, {
            filePath: resolvedPath,
            textPreview: validated.text.substring(0, 40),
            alignment: validated.alignment,
            direction: validated.direction,
        }, [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to add paragraph: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error adding paragraph: ${msg}`);
    }
}
//# sourceMappingURL=add_paragraph.js.map