#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const server_js_1 = require("./server.js");
const logger_js_1 = require("./core/logger.js");
async function main() {
    try {
        logger_js_1.Logger.info('Starting mcp-arabic-ms-word Server...');
        const server = (0, server_js_1.createWordMcpServer)();
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
        logger_js_1.Logger.info('mcp-arabic-ms-word Server running on stdio');
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Fatal server error: ${msg}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map