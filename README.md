# mattermost-mcp-server

This project implements a Model Context Protocol (MCP) server for Mattermost integration. It connects to Mattermost API endpoints to retrieve and process various information, making it available through standard MCP transports.

## Features

- Connects to Mattermost API endpoints
- Supports multiple transport modes:
  - SSE (Server-Sent Events)
  - Standard I/O
- Real-time message processing
- Team and channel-specific monitoring
- Secure token-based authentication

## Requirements

- Node.js >= 22
- npm >= 10

## Setup

1. Clone this repository:

```bash
git clone https://github.com/kakehashi-inc/mattermost-mcp-server.git
cd mattermost-mcp-server
```

2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

## Usage

The server can be run in two transport modes:

### SSE Transport Mode

```bash
npm start -- --endpoint="https://your-mattermost-server" \
            --token="your-mattermost-token" \
            --team-id="your-team-id" \
            --channels="channel1,channel2" \
            --port 8202
```

### Standard I/O Transport Mode

```bash
npm start -- --endpoint="https://your-mattermost-server" \
            --token="your-mattermost-token" \
            --team-id="your-team-id" \
            --channels="channel1,channel2" \
            --stdio
```

### Required Parameters

- `endpoint`: Your Mattermost server URL
- `token`: Your Mattermost authentication token
- `team-id`: The ID of the team to monitor
- `channels`: Comma-separated list of channel names to monitor

### Optional Parameters

- `port`: Port number for SSE transport mode (default: 8202)
- `stdio`: Flag to enable Standard I/O transport mode

## Development

- `npm run dev`: Start the server in development mode with hot reload
- `npm run lint`: Run ESLint
- `npm run format`: Format code using Prettier
- `npm test`: Run tests
- `npm run inspect`: Run MCP inspector

## License

MIT
