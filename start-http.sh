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
  exit 1
fi

# Load environment variables from .env
set -a
source .env
set +a

# Start the server
npx tsx src/main.ts \
  --endpoint "$MATTERMOST_ENDPOINT" \
  --token "$MATTERMOST_TOKEN" \
  --team-id "$MATTERMOST_TEAM_ID" \
  ${MATTERMOST_CHANNELS:+--channels "$MATTERMOST_CHANNELS"} \
  ${MATTERMOST_PORT:+--port "$MATTERMOST_PORT"}
