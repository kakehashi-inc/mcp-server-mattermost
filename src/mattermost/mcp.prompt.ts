import { z, ZodTypeAny } from 'zod';
import { MattermostClient } from './client.js';
import { config } from '../config/config.js';
import type { Message } from './client.js';

const name = 'mattermost';

const description = 'Fetch messages from Mattermost channels with optional search functionality';

const parameters = {
  channels: z
    .string()
    .optional()
    .describe('Comma-separated list of channel IDs to fetch messages from'),
  limit: z.string().optional().describe('Maximum number of messages to fetch per channel'),
  query: z.string().optional().describe('Search query to filter messages'),
};

type Args = z.objectOutputType<typeof parameters, ZodTypeAny>;

const execute = async ({ channels, limit, query }: Args) => {
  const client = new MattermostClient(config.endpoint, config.token);
  const targetChannels = channels?.split(',') ?? config.channels ?? [];
  const messageLimit = limit ? parseInt(limit, 10) : config.limit;

  const messages = [];

  for (const channelId of targetChannels) {
    let channelMessages: Message[];
    if (query) {
      channelMessages = await client.searchMessages(query, [channelId], messageLimit);
    } else {
      channelMessages = await client.getMessages(channelId, messageLimit);
    }

    messages.push({
      role: 'user' as const,
      content: {
        type: 'text' as const,
        text: `Channel: ${channelId}\n${channelMessages
          .map(m => `[${new Date(m.create_at).toISOString()}] ${m.username}: ${m.message}`)
          .join('\n')}`,
      },
    });
  }

  return { messages };
};

export const mattermostPrompt = {
  name,
  description,
  parameters,
  execute,
};
