import { z } from 'zod';
import { MattermostClient } from '../mattermost/client.js';
import { config } from '../config/config.js';
import type { Message } from '../mattermost/client.js';

const name = 'mattermost_search';

const description = 'Fetch messages from Mattermost channels with optional search functionality';

const parametersSchema = {
  channels: z
    .array(z.string())
    .optional()
    .describe(
      'List of channel IDs to fetch messages from. If not provided, uses the default channels.'
    ),
  limit: z
    .number()
    .min(1)
    .optional()
    .describe(
      'Maximum number of messages to fetch per channel. If not provided, uses the default limit.'
    ),
  query: z
    .string()
    .optional()
    .describe(
      'Search query to filter messages. If provided, performs a search instead of fetching recent messages.'
    ),
};

const parameters = z.object(parametersSchema);

const execute = async (args: unknown) => {
  const { channels, limit, query } = parameters.parse(args);
  const client = new MattermostClient(config.endpoint, config.token);
  const targetChannels = channels ?? config.channels ?? [];
  const messageLimit = limit ?? config.limit;

  const messages: { type: 'text'; text: string }[] = [];

  for (const channelId of targetChannels) {
    let channelMessages: Message[];
    if (query) {
      channelMessages = await client.searchMessages(query, [channelId], messageLimit);
    } else {
      channelMessages = await client.getMessages(channelId, messageLimit);
    }

    messages.push({
      type: 'text' as const,
      text: `Channel: ${channelId}\n${channelMessages
        .map(m => `[${new Date(m.create_at).toISOString()}] ${m.username}: ${m.message}`)
        .join('\n')}`,
    });
  }

  return {
    content: messages,
  };
};

export const mattermostSearch = {
  name,
  description,
  parameters,
  execute,
};
