import { z, ZodTypeAny } from 'zod';
import { MattermostClient } from '../mattermost/client.js';
import { config } from '../config/config.js';
import type { Message } from '../mattermost/client.js';

const name = 'mattermost_fetch';

const description = 'Fetch messages from Mattermost channels';

const parameters = {
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

const execute = async ({ channels, limit }: Args) => {
  const client = new MattermostClient(config.endpoint, config.token);
  const targetChannels = channels ?? config.channels ?? [];
  const messageLimit = limit ?? config.limit;

  const messages: { type: 'text'; text: string }[] = [];

  for (const channelName of targetChannels) {
    console.log(`Fetching recent messages from ${channelName} (limit:${messageLimit.toString()})`);

    const channelMessages: Message[] = await client.getMessages(channelName, messageLimit);

    console.log(`Found ${channelMessages.length.toString()} messages`);

    messages.push({
      type: 'text' as const,
      text: `Channel: ${channelName}\n${channelMessages
        .map(m => `[${new Date(m.create_at).toISOString()}] ${m.username}: ${m.message}`)
        .join('\n')}`,
    });
  }

  return {
    content: messages,
  };
};

export const mattermostFetch = {
  name,
  description,
  parameters,
  execute,
};
