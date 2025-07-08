// Client exports
export { createRemoteAPIClient, TRPCClientError } from './client';
export type { RemoteAPIClient, RemoteAPIClientConfig } from './client';

// Schema exports
export type { RemoteAPIRouter } from './schema';

// Re-export all schema types and utilities
export * from './schema';