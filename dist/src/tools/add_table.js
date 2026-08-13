"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTableSchema = void 0;
exports.handleAddTable = handleAddTable;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const docx_builder_js_1 = require("../domain/docx_builder.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.addTableSchema = zod_1.z.object({
    filePath: zod_1.z.string().describe('Path to target .docx file to modify in-place'),
    columns: zod_1.z
        .array(zod_1.z.object({
        header: zod_1.z.string().describe('Column header text label'),
        widthPercent: zod_1.z.number().optional().describe('Column width percentage relative to table width (0-100)'),
    }))
        .min(1)
        .describe('Array of column definitions with header label and width percentage'),
    rows: zod_1.z
        .array(zod_1.z.object({
        cells: zod_1.z.array(zod_1.z.string()).describe('Cell text values matching column count'),
        backgroundColor: zod_1.z.string().optional().describe('Optional six-character hex color code for row background shading'),
    }))
        .describe('Array of row objects containing cell values array and optional background color hex'),
    isRtl: zod_1.z.boolean().optional().default(true).describe('Set to true to apply Right-to-Left visual column order (w:bidiVisual)'),
});
async function handleAddTable(input) {
    try {
        const validated = exports.addTableSchema.parse(input);
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
        builder.addTable(validated.columns, validated.rows, validated.isRtl);
        await builder.saveToFile(resolvedPath);
        return (0, index_js_1.createSuccessEnvelope)(`Appended ${validated.columns.length}x${validated.rows.length} table to '${validated.filePath}'`, {
            filePath: resolvedPath,
            columnsCount: validated.columns.length,
            rowsCount: validated.rows.length,
            isRtl: validated.isRtl,
        }, [{ label: 'Updated Docx', uri: `file:///${resolvedPath.replace(/\\/g, '/')}` }]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to add table: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error adding table: ${msg}`);
    }
}
//# sourceMappingURL=add_table.js.map