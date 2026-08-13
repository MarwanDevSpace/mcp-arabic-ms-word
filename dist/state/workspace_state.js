"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceState = exports.WorkspaceStateTracker = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const index_js_1 = require("../config/index.js");
class WorkspaceStateTracker {
    activeHandles = new Map();
    createDocumentHandle(filePath, builder) {
        const handle = {
            id: node_path_1.default.basename(filePath),
            filePath,
            builder,
            createdAt: new Date(),
            lastModifiedAt: new Date(),
        };
        this.activeHandles.set(handle.id, handle);
        return handle;
    }
    getDocumentHandle(filePathOrId) {
        const id = node_path_1.default.basename(filePathOrId);
        return this.activeHandles.get(id);
    }
    listWorkspaceDocuments() {
        const config = (0, index_js_1.getConfig)();
        const results = [];
        const scanDir = (dir) => {
            if (!node_fs_1.default.existsSync(dir))
                return;
            const entries = node_fs_1.default.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = node_path_1.default.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name !== 'node_modules' && entry.name !== 'dist' && !entry.name.startsWith('.')) {
                        scanDir(fullPath);
                    }
                }
                else if (entry.isFile() && entry.name.endsWith('.docx') && !entry.name.startsWith('~$')) {
                    const stats = node_fs_1.default.statSync(fullPath);
                    results.push({
                        name: entry.name,
                        path: fullPath,
                        sizeBytes: stats.size,
                        modifiedAt: stats.mtime,
                    });
                }
            }
        };
        scanDir(config.workspaceRoot);
        return results;
    }
}
exports.WorkspaceStateTracker = WorkspaceStateTracker;
exports.workspaceState = new WorkspaceStateTracker();
//# sourceMappingURL=workspace_state.js.map