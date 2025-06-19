#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { Request, Response } from 'express';
import { config } from './config/config.js';
import { mattermostSearch } from './mcp-tools/mattermost_search.js';

const mcp = new McpServer({
  name: process.env.npm_package_name ?? 'mcp-server-mattermost',
  version: process.env.npm_package_version ?? '0.0.1',
});

// MCPツールの登録
mcp.tool(
  mattermostSearch.name,
  mattermostSearch.description,
  mattermostSearch.parameters,
  mattermostSearch.execute
);

// クリーンアップ処理を行う関数
async function cleanup(): Promise<void> {
  console.log('Shutting down...');
  try {
    // MCPサーバーのクリーンアップ
    await mcp.close();
  } catch (error: unknown) {
    console.error('Error during cleanup:', error);
  }
  process.exit(0);
}

// シグナルハンドラーの登録
const handleSignal = () => {
  void cleanup();
};

process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);

// 予期せぬエラーのハンドリング
process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  void cleanup();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  void cleanup();
});

// タイプに合わせて処理を実行
if (config.transport === 'http-stream') {
  // Streamable httpモードの場合

} else if (config.transport === 'sse') {
  // SSEモードの場合
  const app = express();

  // to support multiple simultaneous connections we have a lookup object from
  // sessionId to transport
  const transports = new Map<string, SSEServerTransport>();

  app.get('/sse', async (_: Request, res: Response) => {
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);
    res.on('close', () => {
      transports.delete(transport.sessionId);
    });
    await mcp.connect(transport);
  });

  app.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send('No transport found for sessionId');
    }
  });

  console.log(`MCP Server is running on port ${config.port.toString()}`);

  app.listen(config.port);
} else {
  // stdioモードの場合
  const transport = new StdioServerTransport();

  console.log('MCP Server is running on stdio');

  await mcp.connect(transport);
}
