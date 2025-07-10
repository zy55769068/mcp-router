import type { MCPServer } from "@mcp_router/shared";

class ServersStore {
  private servers: Map<string, MCPServer> = new Map();
  private nextId = 1;

  list(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  get(id: string): MCPServer | undefined {
    return this.servers.get(id);
  }

  create(config: Partial<MCPServer>): MCPServer {
    const id = config.id || `server-${this.nextId++}`;

    const server: MCPServer = {
      id,
      name: config.name || "Unnamed Server",
      env: config.env || {},
      serverType: config.serverType || "local",
      status: "stopped",
      ...config,
    };

    this.servers.set(id, server);
    return server;
  }

  update(id: string, config: Partial<MCPServer>): MCPServer | undefined {
    const existing = this.servers.get(id);
    if (!existing) return undefined;

    const updated: MCPServer = {
      ...existing,
      ...config,
      id, // Ensure ID doesn't change
    };

    this.servers.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.servers.delete(id);
  }

  getStatus(id: string): MCPServer["status"] | undefined {
    const server = this.servers.get(id);
    return server?.status;
  }

  setStatus(id: string, status: MCPServer["status"]): void {
    const server = this.servers.get(id);
    if (server) {
      server.status = status;
    }
  }

  start(id: string): void {
    this.setStatus(id, "running");
  }

  stop(id: string): void {
    this.setStatus(id, "stopped");
  }
}

export const serversStore = new ServersStore();
