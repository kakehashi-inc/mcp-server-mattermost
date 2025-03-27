#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { promisify } from 'node:util';
import { config } from './config/config.js';
import { mattermostPrompt } from './mattermost.prompt.js';
import { mattermostTool } from './mattermost.tool.js';

const mcp = new McpServer({
  name: process.env.npm_package_name ?? 'mattermost-mcp-server',
  version: process.env.npm_package_version ?? '0.0.1',
});

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

const app = express();

const transports = new Map<string, SSEServerTransport>();

app.get('/sse', async (_req, res) => {
  const transport = new SSEServerTransport(`/messages`, res);

  transports.set(transport.sessionId, transport);

  await mcp.connect(transport);

  res.on('close', () => {
    transport.close().catch((err: unknown) => {
      console.error(err);
    });
    transports.delete(transport.sessionId);
  });
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  const transport = transports.get(sessionId);

  if (!transport) {
    res.status(404).json({ error: 'Transport not found' });
    return;
  }

  await transport.handlePostMessage(req, res);
});

const server = app.listen(config.port);

console.log(`Server is running on port ${config.port.toString()}`);

const readline = createInterface({ input, output });

await readline.question('Press enter to exit...\n');

readline.close();

server.closeAllConnections();

await promisify(server.close.bind(server))();

await mcp.close();
