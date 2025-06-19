#!/usr/bin/env node

import { FastMCP } from 'fastmcp';
import { config } from './config/config.js';
import { mattermostSearch } from './mcp-tools/mattermost_search.js';

// FastMCPインスタンスの作成
const mcp = new FastMCP({
  name: process.env.npm_package_name ?? 'mcp-server-mattermost',
  version: (process.env.npm_package_version ?? '0.0.1') as `${number}.${number}.${number}`,
});

// MCPツールの登録
mcp.addTool({
  name: mattermostSearch.name,
  description: mattermostSearch.description,
  parameters: mattermostSearch.parameters,
  execute: mattermostSearch.execute,
});

// サーバーの起動
async function startServer() {
  try {
    if (config.transport === 'stdio') {
      console.error('Starting MCP server in stdio mode...');
      await mcp.start({
        transportType: 'stdio',
      });
    } else {
      await mcp.start({
        transportType: 'httpStream',
        httpStream: {
          port: config.port,
        },
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// クリーンアップ処理
async function cleanup(): Promise<void> {
  console.error('Shutting down...');
  try {
    await mcp.stop();
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

// サーバー起動
void startServer();
