import { ArabicDocxBuilder } from '../domain/docx_builder.js';
export interface DocumentHandle {
    id: string;
    filePath: string;
    builder: ArabicDocxBuilder;
    createdAt: Date;
    lastModifiedAt: Date;
}
export declare class WorkspaceStateTracker {
    private activeHandles;
    createDocumentHandle(filePath: string, builder: ArabicDocxBuilder): DocumentHandle;
    getDocumentHandle(filePathOrId: string): DocumentHandle | undefined;
    listWorkspaceDocuments(): Array<{
        name: string;
        path: string;
        sizeBytes: number;
        modifiedAt: Date;
    }>;
}
export declare const workspaceState: WorkspaceStateTracker;
//# sourceMappingURL=workspace_state.d.ts.map