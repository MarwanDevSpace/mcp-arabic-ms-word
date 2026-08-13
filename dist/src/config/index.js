"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const node_path_1 = __importDefault(require("node:path"));
function getConfig() {
    const workspaceRoot = process.env.WORKSPACE_ROOT
        ? node_path_1.default.resolve(process.env.WORKSPACE_ROOT)
        : process.cwd();
    return {
        workspaceRoot,
        defaultFont: process.env.DEFAULT_FONT || 'Amiri',
        defaultDirection: process.env.DEFAULT_DIRECTION || 'rtl',
        defaultPageSize: process.env.DEFAULT_PAGE_SIZE || 'A4',
        defaultMarginCm: process.env.DEFAULT_MARGIN_CM ? parseFloat(process.env.DEFAULT_MARGIN_CM) : 2.54,
        logLevel: process.env.LOG_LEVEL || 'info',
    };
}
//# sourceMappingURL=index.js.map