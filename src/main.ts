#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express, { Request, Response } from 'express';
import { config } from './config/config.js';
import { mattermostPrompt } from './mattermost/mcp.prompt.js';
import { mattermostTool } from './mattermost/mcp.tool.js';

const mcp = new McpServer({
  name: process.env.npm_package_name ?? 'mattermost-mcp-server',
  version: process.env.npm_package_version ?? '0.0.1',
});

// MCPツールとプロンプトの登録
mcp.tool(
  mattermostTool.name,
  mattermostTool.description,
  mattermostTool.parameters,
  mattermostTool.execute
);

mcp.prompt(
  mattermostPrompt.name,
  mattermostPrompt.description,
  mattermostPrompt.parameters,
  mattermostPrompt.execute
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
if (config.stdio) {
  // stdioモードの場合
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
} else {
  // HTTPモードの場合
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
}
