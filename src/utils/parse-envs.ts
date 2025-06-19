type ParsedEnvs = Record<string, string | boolean>;

export function parseEnvs(): ParsedEnvs {
  const parsedEnvs: ParsedEnvs = {};

  if (process.env.MATTERMOST_ENDPOINT) {
    parsedEnvs.endpoint = process.env.MATTERMOST_ENDPOINT;
  }

  if (process.env.MATTERMOST_TOKEN) {
    parsedEnvs.token = process.env.MATTERMOST_TOKEN;
  }

  if (process.env.MATTERMOST_TEAM_ID) {
    parsedEnvs['team-id'] = process.env.MATTERMOST_TEAM_ID;
  }

  if (process.env.MATTERMOST_CHANNELS) {
    parsedEnvs.channels = process.env.MATTERMOST_CHANNELS;
  }

  if (process.env.MATTERMOST_LIMIT) {
    parsedEnvs.limit = process.env.MATTERMOST_LIMIT;
  }

  return parsedEnvs;
}
