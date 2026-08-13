"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHeadingSchema = void 0;
exports.handleAddHeading = handleAddHeading;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const docx_builder_js_1 = require("../domain/docx_builder.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.addHeadingSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to target .docx file to modify in-place'),
    text: zod_1.z.string().describe('Heading text content string'),
    level: zod_1.z.number().int().min(1).max(6).optional().default(1).describe('Heading structural level 1 to 6 (1 for main H1 title, 2 for section H2, etc.)'),
    fontFamily: zod_1.z.string().optional().describe('Font family name (e.g. Amiri, Cairo). Defaults to document default font if omitted'),
    fontSizePt: zod_1.z.number().optional().describe('Font size in points (e.g. 22 for H1, 18 for H2). Calculated automatically if omitted'),
    colorHex: zod_1.z.string().optional().default('1F4E78').describe('Six-character hex color code without leading # (e.g. 1F4E78 for executive dark blue)'),
    alignment: zod_1.z.enum(['right', 'left', 'center', 'justify']).optional().default('right').describe('Horizontal alignment (right, left, center, justify)'),
    direction: zod_1.z.enum(['rtl', 'ltr']).optional().default('rtl').describe('Text direction flag (rtl for Right-to-Left Arabic, ltr for English)'),
});
async function handleAddHeading(input) {
    try {
        const validated = exports.addHeadingSchema.parse(input);
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
        builder.addHeading(validated.text, validated.level, {
            fontFamily: validated.fontFamily,
            fontSizePt: validated.fontSizePt,
            colorHex: validated.colorHex,
            alignment: validated.alignment,
            direction: validated.direction,
        });
        await builder.saveToFile(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Appended H${validated.level} heading to '${validated.filePath}'`, {
            filePath: resolvedPath,
            headingText: validated.text,
            level: validated.level,
        }, [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to add heading: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error adding heading: ${msg}`);
    }
}
//# sourceMappingURL=add_heading.js.map