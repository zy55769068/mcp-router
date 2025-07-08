// Platform-independent stores (no PlatformAPI dependency)
export * from "./theme-store";
export * from "./ui-store";
export * from "./server-editing-store";
export * from "./workspace-store";

// Platform-dependent store factories
export * from "./server-store";
export * from "./auth-store";
export * from "./agent-store";

// Import platform APIs
import { electronPlatformAPI } from "../lib/electron-platform-api";
import { RemotePlatformAPI } from "../lib/remote-platform-api";
import type { PlatformAPI } from "@/lib/platform-api/types/platform-api";

// Import store factories
import { createServerStore, createServerSelectors } from "./server-store";
import { createAuthStore, createAuthSelectors } from "./auth-store";
import { createAgentStore, createAgentSelectors } from "./agent-store";
import { useWorkspaceStore } from "./workspace-store";

// Get the appropriate platform API based on current workspace
function getPlatformAPI(): PlatformAPI {
  const workspace = useWorkspaceStore.getState().currentWorkspace;

  if (workspace?.type === "remote" && workspace.remoteConfig) {
    // For remote workspaces, some operations will throw errors
    // The UI should handle these gracefully
    return new RemotePlatformAPI(workspace.remoteConfig);
  }

  return electronPlatformAPI;
}

// Create store instances with dynamic platform API
let currentAPI = getPlatformAPI();
export const useServerStore = createServerStore(currentAPI);
export const useAuthStore = createAuthStore(currentAPI);
export const useAgentStore = createAgentStore(currentAPI);

// Create selectors from store instances
const serverSelectors = createServerSelectors(useServerStore);
const authSelectors = createAuthSelectors(useAuthStore);
const agentSelectors = createAgentSelectors(useAgentStore);

// Export server selectors
export const useServerById = serverSelectors.useServerById;
export const useServersByStatus = serverSelectors.useServersByStatus;
export const useIsServerUpdating = serverSelectors.useIsServerUpdating;

// Export auth selectors
export const useIsLoggedIn = authSelectors.useIsLoggedIn;
export const useAuthToken = authSelectors.useAuthToken;
export const useUserId = authSelectors.useUserId;

// Export agent selectors
export const useCurrentAgent = agentSelectors.useCurrentAgent;
export const useCurrentSession = agentSelectors.useCurrentSession;
export const useSessionsByAgent = agentSelectors.useSessionsByAgent;

// Re-create stores with new platform API when workspace changes
export const recreateStores = () => {
  const newAPI = getPlatformAPI();

  // Only recreate if API changed
  if (newAPI !== currentAPI) {
    currentAPI = newAPI;

    // Recreate stores with new API
    const serverStore = createServerStore(currentAPI);
    const authStore = createAuthStore(currentAPI);
    const agentStore = createAgentStore(currentAPI);

    // Update exported references
    Object.assign(useServerStore, serverStore);
    Object.assign(useAuthStore, authStore);
    Object.assign(useAgentStore, agentStore);
  }
};

// Store initialization utility
export const initializeStores = async () => {
  // Ensure stores are using correct API
  recreateStores();
  const platformAPI = getPlatformAPI();

  // Initialize auth state from settings
  try {
    const settings = await platformAPI.settings.get();
    await useAuthStore.getState().initializeFromSettings(settings);
  } catch (error) {
    console.error("Failed to initialize auth from settings:", error);
  }

  // Check current auth status
  try {
    await useAuthStore.getState().checkAuthStatus();
  } catch (error) {
    console.error("Failed to check auth status:", error);
  }

  // Load initial server data
  try {
    await useServerStore.getState().refreshServers();
  } catch (error) {
    console.error("Failed to load initial servers:", error);
  }

  // Load initial agent data
  try {
    await useAgentStore.getState().refreshAgents();
  } catch (error) {
    console.error("Failed to load initial agents:", error);
  }
};
