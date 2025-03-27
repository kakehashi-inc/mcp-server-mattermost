#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { config } from './config/config.js';
import { mattermostPrompt } from './mattermost/mcp.prompt.js';
import { mattermostTool } from './mattermost/mcp.tool.js';

const mcp = new McpServer({
  name: process.env.npm_package_name ?? 'mattermost-mcp-server',
  version: process.env.npm_package_version ?? '0.0.1',
  port: config.stdio ? undefined : config.port,
  stdio: config.stdio,
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

if (!config.stdio) {
  console.log(`MCP Server is running on port ${config.port.toString()}`);
}

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});
