"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const index_js_1 = require("../config/index.js");
class Logger {
    static levelPriority = {
        debug: 1,
        info: 2,
        warn: 3,
        error: 4,
    };
    static shouldLog(level) {
        const currentLevel = (0, index_js_1.getConfig)().logLevel;
        return (this.levelPriority[level] ?? 2) >= (this.levelPriority[currentLevel] ?? 2);
    }
    static debug(message, meta) {
        if (this.shouldLog('debug')) {
            process.stderr.write(`[DEBUG] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    }
    static info(message, meta) {
        if (this.shouldLog('info')) {
            process.stderr.write(`[INFO] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    }
    static warn(message, meta) {
        if (this.shouldLog('warn')) {
            process.stderr.write(`[WARN] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    }
    static error(message, meta) {
        if (this.shouldLog('error')) {
            process.stderr.write(`[ERROR] ${new Date().toISOString()} - ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map