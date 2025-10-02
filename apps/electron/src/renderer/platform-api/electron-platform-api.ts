/**
 * Electron-specific Platform API implementation
 */

import type { PlatformAPI } from "@mcp_router/shared";
import type {
  AuthAPI,
  ServerAPI,
  AgentAPI,
  AppAPI,
  PackageAPI,
  SettingsAPI,
  LogAPI,
  WorkspaceAPI,
  WorkflowAPI,
  Workspace,
} from "@mcp_router/shared";

// Electron implementation of the Platform API
class ElectronPlatformAPI implements PlatformAPI {
  auth: AuthAPI;
  servers: ServerAPI;
  agents: AgentAPI;
  apps: AppAPI;
  packages: PackageAPI;
  settings: SettingsAPI;
  logs: LogAPI;
  workspaces: WorkspaceAPI;
  workflows: WorkflowAPI;

  constructor() {
    // Initialize auth domain
    this.auth = {
      // Auth removed: no-ops
      signIn: async (_provider) => false,
      signOut: async () => false,
      getStatus: (forceRefresh) =>
        window.electronAPI.getAuthStatus(forceRefresh).then((status) => ({
          authenticated: status.authenticated ?? false,
          userId: status.userId,
          user: status.user,
          token: status.token,
        })),
      handleToken: async (_token, _state) => false,
      onChange: (callback) =>
        window.electronAPI.onAuthStatusChanged((status) =>
          callback({
            authenticated: status.loggedIn,
            userId: status.userId,
            user: status.user,
          }),
        ),
    };

    // Initialize servers domain
    this.servers = {
      list: () => window.electronAPI.listMcpServers(),
      get: async (id) => {
        const servers = await window.electronAPI.listMcpServers();
        return servers.find((s: any) => s.id === id) || null;
      },
      create: (input) => window.electronAPI.addMcpServer(input),
      update: (id, updates) =>
        window.electronAPI.updateMcpServerConfig(id, updates),
      delete: (id) => window.electronAPI.removeMcpServer(id),
      start: (id) => window.electronAPI.startMcpServer(id),
      stop: (id) => window.electronAPI.stopMcpServer(id),
      getStatus: async (id) => {
        const servers = await window.electronAPI.listMcpServers();
        const server = servers.find((s: any) => s.id === id);
        return server?.status || { type: "stopped" };
      },
      selectFile: (options) => window.electronAPI.serverSelectFile(options),
      tools: {
        list: (serverId) => window.electronAPI.listMcpServerTools(serverId),
        updatePermissions: async (serverId, permissions) => {
          const updated = await window.electronAPI.setMcpServerToolPermissions(
            serverId,
            permissions,
          );
          if (!updated) throw new Error("Failed to update tool permissions");
          return updated;
        },
      },
    };

    // Initialize agents domain (with chat functionality)
    this.agents = {
      // Agent management
      list: () => window.electronAPI.listAgents(),
      get: async (id) => {
        const agent = await window.electronAPI.getAgent(id);
        return agent || null;
      },
      create: (input) => window.electronAPI.createAgent(input),
      update: async (id, updates) => {
        const agent = await window.electronAPI.updateAgent(id, updates);
        if (!agent) throw new Error("Agent not found");
        return agent;
      },
      delete: (id) => window.electronAPI.deleteAgent(id),
      share: (id) => window.electronAPI.shareAgent(id),
      import: (shareCode) => window.electronAPI.importAgent(shareCode),

      // Deployment
      deploy: async (id) => {
        const deployedAgent = await window.electronAPI.deployAgent(id);
        return {
          success: !!deployedAgent,
          deployedAgent,
          error: deployedAgent ? undefined : "Deployment failed",
        };
      },
      getDeployed: async () => {
        const deployed = await window.electronAPI.getDeployedAgents();
        return deployed || [];
      },
      updateDeployed: (id, config) =>
        window.electronAPI.updateDeployedAgent(id, config),
      deleteDeployed: (id) => window.electronAPI.deleteDeployedAgent(id),

      // Tool management
      tools: {
        execute: async (agentId, toolName, args) => {
          const result = await window.electronAPI.executeAgentTool(
            agentId,
            toolName,
            args,
          );
          return result;
        },
        list: async (agentId, serverId, isDev) => {
          const result = await window.electronAPI.getAgentMCPServerTools(
            agentId,
            serverId,
            isDev,
          );
          return result;
        },
      },

      // Session management
      sessions: {
        create: (agentId, initialMessages) =>
          window.electronAPI.createSession(agentId, initialMessages),
        list: (agentId, options) =>
          window.electronAPI.getSessions(agentId, options),
        delete: (sessionId) => window.electronAPI.deleteSession(sessionId),
        update: async (sessionId, messages) => {
          await window.electronAPI.updateSessionMessages(sessionId, messages);
          return {
            id: sessionId,
            agentId: "",
            messages,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        },
      },

      // Streaming chat
      stream: {
        start: (data) => window.electronAPI.sendChatStreamStart(data),
        send: (data) => window.electronAPI.sendChatStreamChunk(data),
        end: (data) => window.electronAPI.sendChatStreamEnd(data),
        error: (data) => window.electronAPI.sendChatStreamError(data),
        onStart: (callback) => window.electronAPI.onChatStreamStart(callback),
        onChunk: (callback) => window.electronAPI.onChatStreamChunk(callback),
        onEnd: (callback) => window.electronAPI.onChatStreamEnd(callback),
        onError: (callback) => window.electronAPI.onChatStreamError(callback),
      },

      // Background chat
      background: {
        start: (sessionId, agentId, query) =>
          window.electronAPI.startBackgroundChat(sessionId, agentId, query),
        stop: (agentId) => window.electronAPI.stopBackgroundChat(agentId),
        onStart: (callback) =>
          window.electronAPI.onBackgroundChatStart(callback),
        onStop: (callback) => window.electronAPI.onBackgroundChatStop(callback),
      },
    };

    // Initialize apps domain (with token management)
    this.apps = {
      list: () => window.electronAPI.listMcpApps(),
      create: (appName) => window.electronAPI.addMcpAppConfig(appName),
      delete: (appName) => window.electronAPI.deleteMcpApp(appName),
      updateServerAccess: (appName, serverIds) =>
        window.electronAPI.updateAppServerAccess(appName, serverIds),
      unifyConfig: (appName) => window.electronAPI.unifyAppConfig(appName),

      // Token management
      tokens: {
        generate: async () => {
          throw new Error("Token generation not available in Electron");
        },
        revoke: async () => {
          throw new Error("Token revocation not available in Electron");
        },
        list: async () => {
          throw new Error("Token listing not available in Electron");
        },
      },
    };

    // Initialize packages domain (with system utilities)
    this.packages = {
      resolveVersions: (argsString, manager) =>
        window.electronAPI.resolvePackageVersionsInArgs(argsString, manager),
      checkUpdates: (args, manager) =>
        window.electronAPI.checkMcpServerPackageUpdates(args, manager),
      checkManagers: () => window.electronAPI.checkPackageManagers(),
      installManagers: () => window.electronAPI.installPackageManagers(),

      // System utilities
      system: {
        getPlatform: () => window.electronAPI.getPlatform(),
        checkCommand: (command) =>
          window.electronAPI.checkCommandExists(command),
        restartApp: () => window.electronAPI.restartApp(),
        checkForUpdates: () => window.electronAPI.checkForUpdates(),
        installUpdate: () => window.electronAPI.installUpdate(),
        onUpdateAvailable: (callback) =>
          window.electronAPI.onUpdateAvailable(callback),
        onProtocolUrl: (callback) => window.electronAPI.onProtocolUrl(callback),
      },
    };

    // Initialize settings domain
    this.settings = {
      get: () => window.electronAPI.getSettings(),
      save: (settings) => window.electronAPI.saveSettings(settings),
      incrementOverlayCount: () =>
        window.electronAPI.incrementPackageManagerOverlayCount(),
      submitFeedback: (feedback) => window.electronAPI.submitFeedback(feedback),
    };

    // Initialize logs domain
    this.logs = {
      query: async (options) => {
        const result = await window.electronAPI.getRequestLogs(options);
        // Ensure consistent return type with LogQueryResult
        return {
          ...result,
          items: result.logs, // LogQueryResult extends CursorPaginationResult which requires items
          // logs property is already included from spread operator
        };
      },
    };

    // Initialize workspaces domain
    this.workspaces = {
      list: () => window.electronAPI.listWorkspaces(),
      get: async (id) => {
        const workspaces = await window.electronAPI.listWorkspaces();
        return workspaces.find((w: Workspace) => w.id === id) || null;
      },
      create: (input) => window.electronAPI.createWorkspace(input),
      update: async (id, updates) => {
        await window.electronAPI.updateWorkspace(id, updates);
        // Return the updated workspace
        const workspaces = await window.electronAPI.listWorkspaces();
        const updated = workspaces.find((w: Workspace) => w.id === id);
        if (!updated) throw new Error("Workspace not found");
        return updated;
      },
      delete: async (id) => {
        await window.electronAPI.deleteWorkspace(id);
      },
      switch: async (id) => {
        await window.electronAPI.switchWorkspace(id);
      },
      getActive: () => window.electronAPI.getCurrentWorkspace(),
    };

    // Initialize workflows domain (with hook modules)
    this.workflows = {
      // Workflow operations
      workflows: {
        list: () => window.electronAPI.listWorkflows(),
        get: (id) => window.electronAPI.getWorkflow(id),
        create: (workflow) => window.electronAPI.createWorkflow(workflow),
        update: (id, updates) => window.electronAPI.updateWorkflow(id, updates),
        delete: (id) => window.electronAPI.deleteWorkflow(id),
        setActive: (id) => window.electronAPI.setActiveWorkflow(id),
        disable: (id) => window.electronAPI.disableWorkflow(id),
        execute: (id, context) =>
          window.electronAPI.executeWorkflow(id, context),
        listEnabled: () => window.electronAPI.getEnabledWorkflows(),
        listByType: (workflowType) =>
          window.electronAPI.getWorkflowsByType(workflowType),
      },

      // Hook Module operations
      hooks: {
        list: () => window.electronAPI.listHookModules(),
        get: (id) => window.electronAPI.getHookModule(id),
        create: (module) => window.electronAPI.createHookModule(module),
        update: (id, updates) =>
          window.electronAPI.updateHookModule(id, updates),
        delete: (id) => window.electronAPI.deleteHookModule(id),
        execute: (id, context) =>
          window.electronAPI.executeHookModule(id, context),
        import: (module) => window.electronAPI.importHookModule(module),
        validate: (script) => window.electronAPI.validateHookScript(script),
      },
    };
  }
}

// Create the Platform API instance
export const electronPlatformAPI = new ElectronPlatformAPI();
