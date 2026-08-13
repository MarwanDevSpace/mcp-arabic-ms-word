import path from 'node:path';
import { getConfig } from '../config/index.js';
import { SecurityError } from '../core/errors.js';

/**
 * Validates and resolves a file path to ensure it is strictly within the allowed workspace boundary.
 */
export function resolveWorkspacePath(relativePathOrAbsolute: string): string {
  const config = getConfig();
  const absolutePath = path.isAbsolute(relativePathOrAbsolute)
    ? path.normalize(relativePathOrAbsolute)
    : path.normalize(path.join(config.workspaceRoot, relativePathOrAbsolute));

  const normalizedWorkspace = path.normalize(config.workspaceRoot);

  // Check if target path starts with workspace path
  const relative = path.relative(normalizedWorkspace, absolutePath);
  const isOutside = relative.startsWith('..') || path.isAbsolute(relative);

  if (isOutside) {
    throw new SecurityError(
      `Access denied: path '${relativePathOrAbsolute}' resolves outside workspace boundary '${config.workspaceRoot}'`
    );
  }

  return absolutePath;
}
