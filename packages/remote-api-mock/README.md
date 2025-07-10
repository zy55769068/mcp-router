# @mcp_router/remote-api-mock

Mock server implementation for the MCP Router Remote API.

## Features

- Full implementation of the Remote API schema
- In-memory data storage
- Bearer token authentication (use `mock-token`)
- Sample data initialization
- tRPC-based API matching the production schema

## Usage

### Development

```bash
# Install dependencies
pnpm install

# Start the mock server
pnpm dev
```

The server will start on `http://localhost:3001` with the tRPC endpoint at `/trpc`.

### Authentication

All endpoints require authentication. Include the following header in your requests:

```
Authorization: Bearer mock-token
```

### Endpoints

#### Servers API
- `GET /trpc/servers.list` - List all servers
- `GET /trpc/servers.get` - Get a specific server
- `POST /trpc/servers.create` - Create a new server
- `POST /trpc/servers.update` - Update a server
- `POST /trpc/servers.delete` - Delete a server
- `POST /trpc/servers.start` - Start a server
- `POST /trpc/servers.stop` - Stop a server
- `GET /trpc/servers.getStatus` - Get server status

#### Logs API
- `GET /trpc/logs.list` - List logs with pagination
- `GET /trpc/logs.get` - Get a specific log
- `POST /trpc/logs.delete` - Delete a log
- `POST /trpc/logs.clear` - Clear logs

### Testing with the Client

```typescript
import { createRemoteAPIClient } from '@mcp_router/remote-api-types'

const client = createRemoteAPIClient({
  baseUrl: 'http://localhost:3006',
  token: 'mock-token'
})

// Use the client
const servers = await client.servers.list.query()
```