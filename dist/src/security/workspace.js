"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWorkspacePath = resolveWorkspacePath;
const node_path_1 = __importDefault(require("node:path"));
const index_js_1 = require("../config/index.js");
const errors_js_1 = require("../core/errors.js");
/**
 * Validates and resolves a file path to ensure it is strictly within the allowed workspace boundary.
 */
function resolveWorkspacePath(relativePathOrAbsolute) {
    const config = (0, index_js_1.getConfig)();
    const absolutePath = node_path_1.default.isAbsolute(relativePathOrAbsolute)
        ? node_path_1.default.normalize(relativePathOrAbsolute)
        : node_path_1.default.normalize(node_path_1.default.join(config.workspaceRoot, relativePathOrAbsolute));
    const normalizedWorkspace = node_path_1.default.normalize(config.workspaceRoot);
    // Check if target path starts with workspace path
    const relative = node_path_1.default.relative(normalizedWorkspace, absolutePath);
    const isOutside = relative.startsWith('..') || node_path_1.default.isAbsolute(relative);
    if (isOutside) {
        throw new errors_js_1.SecurityError(`Access denied: path '${relativePathOrAbsolute}' resolves outside workspace boundary '${config.workspaceRoot}'`);
    }
    return absolutePath;
}
//# sourceMappingURL=workspace.js.map