import { z } from "zod";

// LogQueryOptions Zodスキーマ
export const logQueryOptionsSchema = z.object({
  clientId: z.string().optional(),
  serverId: z.string().optional(),
  requestType: z.string().optional(),
  startDate: z.string().optional(), // ISO string
  endDate: z.string().optional(), // ISO string
  responseStatus: z.enum(["success", "error"]).optional(),
  offset: z.number().optional(),
  limit: z.number().optional(),
});

// 型定義
export interface RequestLogEntry {
  id: string;
  timestamp: number;
  clientId: string;
  clientName: string;
  serverId: string;
  serverName: string;
  requestType: string;
  requestParams: any;
  responseStatus: "success" | "error";
  responseData?: any;
  duration: number;
  errorMessage?: string;
}

export type LogQueryOptions = z.infer<typeof logQueryOptionsSchema>;

// tRPC Router型定義
export type LogsRouter = {
  list: {
    query: (input?: LogQueryOptions) => Promise<{
      logs: RequestLogEntry[];
      total: number;
    }>;
  };
  get: {
    query: (input: { id: string }) => Promise<RequestLogEntry | null>;
  };
  delete: {
    mutate: (input: { id: string }) => Promise<void>;
  };
  clear: {
    mutate: (input?: { serverId?: string }) => Promise<void>;
  };
};
