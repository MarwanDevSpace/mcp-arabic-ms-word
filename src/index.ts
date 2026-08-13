#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createWordMcpServer } from './server.js';
import { Logger } from './core/logger.js';

async function main() {
  try {
    Logger.info('Starting mcp-arabic-ms-word Server...');
    const server = createWordMcpServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
    Logger.info('mcp-arabic-ms-word Server running on stdio');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Fatal server error: ${msg}`);
    process.exit(1);
  }
}

main();
