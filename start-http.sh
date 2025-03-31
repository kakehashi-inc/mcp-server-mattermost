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

# Start Inspector in background
npx -y @modelcontextprotocol/inspector node build/index.js & INSPECTOR_PID=$!

# Start the server in background
dotenvx run -q -- npx tsx src/main.ts & SERVER_PID=$!

# Trap SIGTERM and SIGINT to cleanup child processes
cleanup() {
  echo "Shutting down subprocesses..."
  kill $INSPECTOR_PID $SERVER_PID 2>/dev/null
  wait $INSPECTOR_PID $SERVER_PID 2>/dev/null
  echo "Shutdown complete"
  exit 0
}
trap cleanup SIGTERM SIGINT

# Wait for child processes
wait $INSPECTOR_PID $SERVER_PID
