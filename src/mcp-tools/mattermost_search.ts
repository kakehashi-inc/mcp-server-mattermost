import { z, ZodTypeAny } from 'zod';
import { MattermostClient } from '../mattermost/client.js';
import { config } from '../config/config.js';
import type { Message } from '../mattermost/client.js';

const name = 'mattermost_search';

const description = 'Fetch messages from Mattermost channels with optional search functionality';

const parameters = {
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

type Args = z.objectOutputType<typeof parameters, ZodTypeAny>;

const execute = async ({ channels, limit, query }: Args) => {
  const client = new MattermostClient(config.endpoint, config.token);
  const targetChannels = channels ?? config.channels ?? [];
  const messageLimit = limit ?? config.limit;

  const messages: { type: 'text'; text: string }[] = [];

  for (const channelId of targetChannels) {
    let channelMessages: Message[];
    if (query) {
      console.log(`Searching messages from ${channelId} with query: ${query} (limit:${messageLimit.toString()})`);
      channelMessages = await client.searchMessages(query, [channelId], messageLimit);
      console.log(`Found ${channelMessages.length.toString()} messages`);
    } else {
      console.log(`Fetching recent messages from ${channelId} (limit:${messageLimit.toString()})`);
      channelMessages = await client.getMessages(channelId, messageLimit);
      console.log(`Found ${channelMessages.length.toString()} messages`);
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
