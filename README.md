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
- dotenvx
  - [dotenvx](https://dotenvx.com/)

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

3. Set up your environment variables:

```bash
# Create .env file
cp .env.example .env

# Encrypt your .env file (optional but recommended for production)
dotenvx encrypt
```

Required environment variables:

- `MCP_PORT`: Port number for SSE transport mode (default: 8201)
- `MATTERMOST_ENDPOINT`: Your Mattermost server URL
- `MATTERMOST_TOKEN`: Your Mattermost authentication token
- `MATTERMOST_TEAM_ID`: The ID of the team to monitor
- `MATTERMOST_CHANNELS`: Comma-separated list of channel names to monitor

4. Build the server:

```bash
npm run build
```

## Usage

The server can be run in two transport modes:

### SSE Transport Mode

```bash
npm start
```

### Standard I/O Transport Mode

```bash
npm start -- --stdio
```

## Development

- `npm run dev`: Start the server in development mode with hot reload
- `npm run lint`: Run ESLint
- `npm run format`: Format code using Prettier
- `npm test`: Run tests
- `npm run inspect`: Run MCP inspector

## References

- [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP inspector](https://github.com/modelcontextprotocol/inspector)

## License

MIT
