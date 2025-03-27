import { z } from 'zod';
import { parseArgs } from '../utils/parse-args.js';

export const argsSchema = z.object({
  endpoint: z.string(),
  token: z.string(),
  'team-id': z.string(),
  channels: z.array(z.string().optional()),
  limit: z.number().optional().default(100),
  port: z.coerce.number().optional().default(8080),
});

export type Config = z.infer<typeof argsSchema>;

export const config = argsSchema.parse(parseArgs());
