import { getConfig } from '../config/index.js';

export class Logger {
  private static levelPriority: Record<string, number> = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  private static shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const currentLevel = getConfig().logLevel;
    return (this.levelPriority[level] ?? 2) >= (this.levelPriority[currentLevel] ?? 2);
  }

  public static debug(message: string, meta?: unknown): void {
    if (this.shouldLog('debug')) {
      process.stderr.write(`[DEBUG] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
    }
  }

  public static info(message: string, meta?: unknown): void {
    if (this.shouldLog('info')) {
      process.stderr.write(`[INFO] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
    }
  }

  public static warn(message: string, meta?: unknown): void {
    if (this.shouldLog('warn')) {
      process.stderr.write(`[WARN] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
    }
  }

  public static error(message: string, meta?: unknown): void {
    if (this.shouldLog('error')) {
      process.stderr.write(`[ERROR] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
    }
  }
}
