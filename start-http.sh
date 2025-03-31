#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file based on .env.example with your settings."
  echo "Required environment variables:"
  echo "  MATTERMOST_ENDPOINT  - Mattermost server endpoint"
  echo "  MATTERMOST_TOKEN    - Mattermost access token"
  echo "  MATTERMOST_TEAM_ID  - Mattermost team ID"
  echo "Optional environment variables:"
  echo "  MATTERMOST_CHANNELS - Comma-separated channel IDs"
  echo "  MATTERMOST_PORT     - Server port"
  echo "  MATTERMOST_LIMIT    - Number of messages to fetch"
  exit 1
fi

# Start Inspector
npx -y @modelcontextprotocol/inspector node build/index.js

# Start the server
dotenvx run -q -- npx tsx src/main.ts
