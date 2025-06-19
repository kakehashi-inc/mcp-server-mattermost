# mcp-server-mattermost

This project implements a Model Context Protocol (MCP) server for Mattermost integration. It connects to Mattermost API endpoints to retrieve and process various information, making it available through standard MCP transports.

## Features

- Connects to Mattermost API endpoints
- Supports multiple transport modes:
  - Standard I/O
  - Streamable HTTP
- Real-time message processing
- Team and channel-specific monitoring
- Secure token-based authentication
- Built with FastMCP for simplified MCP server implementation

## Requirements

- Node.js >= 22
- npm >= 10
- dotenvx
  - [dotenvx](https://dotenvx.com/)

## Setup

1. Clone this repository:

```bash
git clone https://github.com/kakehashi-inc/mcp-server-mattermost.git
cd mcp-server-mattermost
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

- `MATTERMOST_ENDPOINT`: Your Mattermost server URL
- `MATTERMOST_TOKEN`: Your Mattermost authentication token
- `MATTERMOST_TEAM_ID`: The ID of the team to monitor
- `MATTERMOST_CHANNELS`: Comma-separated list of channel names to monitor

4. Build the server:

```bash
npm run build
```

## Usage

The server supports three transport modes: stdio (default), sse, and http-stream.

### Standard I/O Transport Mode

```bash
npm run start:stdio
# or
npx dotenvx run -q -- "node dist/main.js --transport stdio"
```

### SSE Transport Mode

```bash
npm run start:sse
# or
npx dotenvx run -q -- "node dist/main.js --transport sse"
```

### HTTP Transport Mode

```bash
npm run start:http
# or
npx dotenvx run -q -- "node dist/main.js --transport http-stream"
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
