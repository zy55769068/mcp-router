/* eslint-disable no-undef */
import type { PlatformAPI } from "@/lib/platform-api/types/platform-api";
import type {
  MCPServerConfig,
} from "@mcp-router/shared";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Remote Platform API implementation that communicates with a remote API server
 * Only servers and logs are handled remotely, all other operations are delegated to local Electron API
 */
export class RemotePlatformAPI implements PlatformAPI {
  private config: RemoteWorkspaceConfig;
  private baseUrl: string;

  constructor(config: RemoteWorkspaceConfig) {
    this.config = config;
    this.baseUrl = config.apiUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  private async fetch<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.authToken}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Unknown error");
      }

      return result.data!;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  // Server API implementation - CRUD remote, execution local
  readonly servers = {
    list: async (): Promise<Server[]> => {
      const configs = await this.fetch<MCPServerConfig[]>("/api/servers");
      return configs.map((config) => ({
        id: config.id!,
        name: config.name,
        config,
        status: { type: "stopped" as const },
      }));
    },

    get: async (id: string): Promise<Server | null> => {
      try {
        const config = await this.fetch<MCPServerConfig>(`/api/servers/${id}`);
        return {
          id: config.id!,
          name: config.name,
          config,
          status: { type: "stopped" as const },
        };
      } catch {
        return null;
      }
    },

    create: async (input: CreateServerInput): Promise<Server> => {
      const config = await this.fetch<MCPServerConfig>("/api/servers", {
        method: "POST",
        body: JSON.stringify(input.config),
      });
      return {
        id: config.id!,
        name: input.name,
        config,
        status: { type: "stopped" as const },
      };
    },

    update: async (id: string, updates: UpdateServerInput): Promise<Server> => {
      const config = await this.fetch<MCPServerConfig>(`/api/servers/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates.config || {}),
      });
      return {
        id: config.id!,
        name: updates.name || config.name,
        config,
        status: { type: "stopped" as const },
      };
    },

    delete: async (id: string): Promise<void> => {
      await this.fetch(`/api/servers/${id}`, {
        method: "DELETE",
      });
    },

    // Server execution operations - Delegate to local implementation
    start: async (id: string): Promise<boolean> => {
      return electronPlatformAPI.servers.start(id);
    },

    stop: async (id: string): Promise<boolean> => {
      return electronPlatformAPI.servers.stop(id);
    },

    getStatus: async (id: string): Promise<ServerStatus> => {
      return electronPlatformAPI.servers.getStatus(id);
    },

    fetchFromIndex: async (
      page?: number,
      limit?: number,
      search?: string,
      isVerified?: boolean,
    ) => {
      return electronPlatformAPI.servers.fetchFromIndex(page, limit, search, isVerified);
    },

    fetchVersionDetails: async (displayId: string, version: string) => {
      return electronPlatformAPI.servers.fetchVersionDetails(displayId, version);
    },
  };

  // Log API implementation
  logs = {
    query: async (options?: LogQueryOptions): Promise<LogQueryResult> => {
      const params = new URLSearchParams();
      if (options?.clientId) params.append("clientId", options.clientId);
      if (options?.serverId) params.append("serverId", options.serverId);
      if (options?.requestType)
        params.append("requestType", options.requestType);
      if (options?.responseStatus)
        params.append("responseStatus", options.responseStatus);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const logs = await this.fetch<LogEntry[]>(`/api/logs?${params}`);
      return {
        logs,
        total: logs.length, // Remote API should ideally return total count
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