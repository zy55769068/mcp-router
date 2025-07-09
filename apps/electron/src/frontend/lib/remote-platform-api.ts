import type { PlatformAPI } from "@/lib/platform-api/types/platform-api";
import {
  createRemoteAPIClient,
  type RemoteAPIClient,
} from "@mcp_router/remote-api-types";
import type {
  Server,
  ServerStatus,
  CreateServerInput,
  UpdateServerInput,
} from "@/lib/platform-api/types/domains/server-api";
import type {
  LogQueryOptions,
  LogEntry,
  LogQueryResult,
} from "@/lib/platform-api/types/domains/log-api";

interface RemoteWorkspaceConfig {
  apiUrl: string;
  authToken: string;
}

/**
 * Remote Platform API implementation that communicates with a remote API server using tRPC
 * Only servers and logs are handled remotely, all other operations are delegated to local Electron API
 */
export class RemotePlatformAPI implements PlatformAPI {
  private client: RemoteAPIClient;

  constructor(config: RemoteWorkspaceConfig) {
    this.client = createRemoteAPIClient({
      url: config.apiUrl.replace(/\/$/, ""), // Remove trailing slash
      token: config.authToken,
    });
  }

  // Server API implementation - All operations remote via tRPC
  readonly servers = {
    list: async (): Promise<Server[]> => {
      const servers = await this.client.servers.list.query();
      // Type conversion to ensure compatibility
      return servers as unknown as Server[];
    },

    get: async (id: string): Promise<Server | null> => {
      const server = await this.client.servers.get.query({ id });
      return server as unknown as Server | null;
    },

    create: async (input: CreateServerInput): Promise<Server> => {
      const server = await this.client.servers.create.mutate(input);
      return server as unknown as Server;
    },

    update: async (id: string, updates: UpdateServerInput): Promise<Server> => {
      const server = await this.client.servers.update.mutate({
        id,
        ...updates,
      });
      return server as unknown as Server;
    },

    delete: async (id: string): Promise<void> => {
      await this.client.servers.delete.mutate({ id });
    },

    // Server execution operations - Remote only
    start: async (id: string): Promise<boolean> => {
      await this.client.servers.start.mutate({ id });
      return true;
    },

    stop: async (id: string): Promise<boolean> => {
      await this.client.servers.stop.mutate({ id });
      return true;
    },

    getStatus: async (id: string): Promise<ServerStatus> => {
      const status = await this.client.servers.getStatus.query({ id });
      return status as unknown as ServerStatus;
    },

    fetchFromIndex: async (
      _page?: number,
      _limit?: number,
      _search?: string,
      _isVerified?: boolean,
    ) => {
      // This operation is specific to the MCP index and might not be available remotely
      throw new Error("fetchFromIndex is not supported in remote workspaces");
    },

    fetchVersionDetails: async (_displayId: string, _version: string) => {
      // This operation is specific to the MCP index and might not be available remotely
      throw new Error(
        "fetchVersionDetails is not supported in remote workspaces",
      );
    },
  };

  // Log API implementation via tRPC
  logs = {
    query: async (options?: LogQueryOptions): Promise<LogQueryResult> => {
      const result = await this.client.logs.list.query({
        clientId: options?.clientId,
        serverId: options?.serverId,
        requestType: options?.requestType,
        responseStatus: options?.responseStatus,
        limit: options?.limit,
        cursor: options?.cursor,
        startDate: options?.startDate?.toISOString(),
        endDate: options?.endDate?.toISOString(),
      });

      // Convert RequestLogEntry to LogEntry format
      const logs: LogEntry[] = result.logs.map((log) => ({
        id: log.id,
        timestamp: new Date(log.timestamp),
        clientId: log.clientId,
        serverId: log.serverId,
        requestType: log.requestType,
        responseStatus: log.responseStatus,
        duration: log.duration,
        error: log.errorMessage,
        details: {
          clientName: log.clientName,
          serverName: log.serverName,
          requestParams: log.requestParams,
          responseData: log.responseData,
        },
      }));

      return {
        logs,
        total: result.total,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      };
    },
  };

  // All other APIs delegate to local implementation
  get agents() {
    return electronPlatformAPI.agents;
  }

  get apps() {
    return electronPlatformAPI.apps;
  }

  get auth() {
    return electronPlatformAPI.auth;
  }

  get packages() {
    return electronPlatformAPI.packages;
  }

  get settings() {
    return electronPlatformAPI.settings;
  }

  get workspaces() {
    return electronPlatformAPI.workspaces;
  }
}

// Import at the end to avoid circular dependency
import { electronPlatformAPI } from "./electron-platform-api";
