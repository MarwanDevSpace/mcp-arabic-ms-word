import path from 'node:path';

export interface ServerConfig {
  workspaceRoot: string;
  defaultFont: string;
  defaultDirection: 'rtl' | 'ltr';
  defaultPageSize: 'A4' | 'Letter' | 'A3';
  defaultMarginCm: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function getConfig(): ServerConfig {
  const workspaceRoot = process.env.WORKSPACE_ROOT
    ? path.resolve(process.env.WORKSPACE_ROOT)
    : process.cwd();

  return {
    workspaceRoot,
    defaultFont: process.env.DEFAULT_FONT || 'Amiri',
    defaultDirection: (process.env.DEFAULT_DIRECTION as 'rtl' | 'ltr') || 'rtl',
    defaultPageSize: (process.env.DEFAULT_PAGE_SIZE as 'A4' | 'Letter' | 'A3') || 'A4',
    defaultMarginCm: process.env.DEFAULT_MARGIN_CM ? parseFloat(process.env.DEFAULT_MARGIN_CM) : 2.54,
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  };
}
