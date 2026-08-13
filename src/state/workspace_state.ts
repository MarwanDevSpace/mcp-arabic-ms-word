import fs from 'node:fs';
import path from 'node:path';
import { getConfig } from '../config/index.js';
import { ArabicDocxBuilder } from '../domain/docx_builder.js';

export interface DocumentHandle {
  id: string;
  filePath: string;
  builder: ArabicDocxBuilder;
  createdAt: Date;
  lastModifiedAt: Date;
}

export class WorkspaceStateTracker {
  private activeHandles: Map<string, DocumentHandle> = new Map();

  public createDocumentHandle(
    filePath: string,
    builder: ArabicDocxBuilder
  ): DocumentHandle {
    const handle: DocumentHandle = {
      id: path.basename(filePath),
      filePath,
      builder,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    };
    this.activeHandles.set(handle.id, handle);
    return handle;
  }

  public getDocumentHandle(filePathOrId: string): DocumentHandle | undefined {
    const id = path.basename(filePathOrId);
    return this.activeHandles.get(id);
  }

  public listWorkspaceDocuments(): Array<{ name: string; path: string; sizeBytes: number; modifiedAt: Date }> {
    const config = getConfig();
    const results: Array<{ name: string; path: string; sizeBytes: number; modifiedAt: Date }> = [];

    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== 'dist' && !entry.name.startsWith('.')) {
            scanDir(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.docx') && !entry.name.startsWith('~$')) {
          const stats = fs.statSync(fullPath);
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

export const workspaceState = new WorkspaceStateTracker();
