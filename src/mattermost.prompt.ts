import { z, ZodTypeAny } from 'zod';
import { config } from './config/config.js';

const name = 'mattermost';

const description = 'Fetch a URL and extract its contents as markdown';

const parameters = {
  url: z.string().describe('URL to fetch.'),
};

type Args = z.objectOutputType<typeof parameters, ZodTypeAny>;

// PromptCallback<typeof parameters>
const execute = async ({ url }: Args) => {
  let content, prefix;

  const result = [prefix, content].join('\n').trim();

  return {
    messages: [
      {
        role: 'user',
        content: { type: 'text', text: result },
      } as const,
    ],
  };
};

export const mattermostPrompt = {
  name,
  description,
  parameters,
  execute,
};
