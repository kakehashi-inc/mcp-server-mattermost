import { z, ZodTypeAny } from 'zod';
import { MattermostClient } from '../mattermost/client.js';
import { config } from '../config/config.js';
import type { Message } from '../mattermost/client.js';

const name = 'mattermost_search';

const description =
  'Search messages from Mattermost channels. return json of messages grouped by channel.';

const parameters = {
  query: z.string().describe('Search query to filter messages.'),
  channels: z
    .array(z.string())
    .optional()
    .describe(
      'List of channel names to fetch messages from. If not provided, uses the default channels.'
    ),
  limit: z
    .number()
    .min(1)
    .optional()
    .describe(
      'Maximum number of messages to fetch per channel. If not provided, uses the default limit.'
    ),
};

type Args = z.objectOutputType<typeof parameters, ZodTypeAny>;

const execute = async ({ channels, limit, query }: Args) => {
  const client = new MattermostClient(config.endpoint, config.token);
  const targetChannels = await client.getTargetChannelNames(channels, config.channels);
  const messageLimit = limit ?? config.limit;

  const messages: { type: 'text'; text: string }[] = [];

  // クエリ未指定はエラーを返す
  if (!query) {
    throw new Error('Query is required');
  }

  for (const channelName of targetChannels) {
    console.log(
      `Searching messages from ${channelName} with query: ${query} (limit:${messageLimit.toString()})`
    );

    const channelMessages: Message[] = await client.searchMessagesByName(
      query,
      [channelName],
      messageLimit
    );

    console.log(`Found ${channelMessages.length.toString()} messages`);

    messages.push({
      type: 'text' as const,
      text: JSON.stringify({
        channel: channelName,
        messages: channelMessages,
      }),
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
