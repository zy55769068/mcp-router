import { z } from 'zod';

// MCPServerConfig Zodスキーマ
export const mcpServerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  env: z.record(z.string()),
  setupInstructions: z.string().optional(),
  autoStart: z.boolean().optional(),
  disabled: z.boolean().optional(),
  description: z.string().optional(),
  serverType: z.enum(['local', 'remote', 'remote-streamable']),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  remoteUrl: z.string().optional(),
  bearerToken: z.string().optional(),
  inputParams: z.record(
    z.object({
      default: z.string(),
      description: z.string(),
    })
  ).optional(),
  required: z.array(z.string()).optional(),
  latestVersion: z.string().optional(),
  verificationStatus: z.enum(['verified', 'unverified']).optional(),
  version: z.string().optional(),
  toolPermissions: z.record(z.string(), z.boolean()).optional(),
});

// CreateServerInput Zodスキーマ
export const createServerSchema = z.object({
  name: z.string(),
  config: mcpServerConfigSchema,
});

// UpdateServerInput Zodスキーマ
export const updateServerSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  config: mcpServerConfigSchema.partial().optional(),
});

// 削除用スキーマ
export const deleteServerSchema = z.object({
  id: z.string(),
});

// 型定義
export interface ServerStatus {
  type: "stopped" | "starting" | "running" | "stopping" | "error";
  error?: string;
  connectedAt?: Date;
  stats?: {
    requests: number;
    errors: number;
    uptime: number;
  };
}

export interface Server {
  id: string;
  name: string;
  config: z.infer<typeof mcpServerConfigSchema>;
  status?: ServerStatus;
}

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;

// tRPC Router型定義
export type ServersRouter = {
  list: {
    query: () => Promise<Server[]>;
  };
  get: {
    query: (input: { id: string }) => Promise<Server | null>;
  };
  create: {
    mutate: (input: CreateServerInput) => Promise<Server>;
  };
  update: {
    mutate: (input: UpdateServerInput & { id: string }) => Promise<Server>;
  };
  delete: {
    mutate: (input: { id: string }) => Promise<void>;
  };
  start: {
    mutate: (input: { id: string }) => Promise<void>;
  };
  stop: {
    mutate: (input: { id: string }) => Promise<void>;
  };
  getStatus: {
    query: (input: { id: string }) => Promise<ServerStatus>;
  };
};