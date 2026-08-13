"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImageSchema = void 0;
exports.handleAddImage = handleAddImage;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const docx_builder_js_1 = require("../domain/docx_builder.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.addImageSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to target .docx file to modify in-place'),
    imagePath: zod_1.z.string().describe('Absolute or workspace path to valid input image file (PNG, JPEG, GIF)'),
    widthPx: zod_1.z.number().optional().default(300).describe('Display width in pixels inside document layout (default: 300)'),
    heightPx: zod_1.z.number().optional().default(200).describe('Display height in pixels inside document layout (default: 200)'),
    align: zod_1.z.enum(['right', 'center', 'left']).optional().default('center').describe('Horizontal image positioning relative to text margins (right, center, left)'),
});
async function handleAddImage(input) {
    try {
        const validated = exports.addImageSchema.parse(input);
        const resolvedDocPath = (0, workspace_js_1.resolveWorkspacePath)(validated.filePath);
        const resolvedImgPath = (0, workspace_js_1.resolveWorkspacePath)(validated.imagePath);
        let handle = workspace_state_js_1.workspaceState.getDocumentHandle(resolvedDocPath);
        let builder;
        if (handle) {
            builder = handle.builder;
        }
        else {
            builder = new docx_builder_js_1.ArabicDocxBuilder();
            workspace_state_js_1.workspaceState.createDocumentHandle(resolvedDocPath, builder);
        }
        builder.addImage(resolvedImgPath, validated.widthPx, validated.heightPx, validated.align);
        await builder.saveToFile(resolvedDocPath);
        return (0, index_js_1.createSuccessEnvelope)(`Appended image to '${validated.filePath}'`, {
            docPath: resolvedDocPath,
            imgPath: resolvedImgPath,
            widthPx: validated.widthPx,
            heightPx: validated.heightPx,
        }, [{ label: 'Updated Docx', uri: `file:///${resolvedDocPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to add image: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error adding image: ${msg}`);
    }
}
//# sourceMappingURL=add_image.js.map