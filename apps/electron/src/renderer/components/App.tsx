import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import PageLayout from "./layout/PageLayout";
import { Sonner } from "@mcp_router/ui";
import { toast } from "sonner";
import DiscoverWrapper from "@/renderer/components/mcp/server/DiscoverWrapper";
import Home from "./Home";
import { useTranslation } from "react-i18next";
import SidebarComponent from "./Sidebar";
import { SidebarProvider } from "@mcp_router/ui";
import McpAppsManager from "@/renderer/components/mcp/apps/McpAppsManager";
import LogViewer from "@/renderer/components/mcp/log/LogViewer";
import AgentBuild from "@/renderer/components/agent/create/AgentBuild";
import AgentCreate from "@/renderer/components/agent/create/AgentCreate";
import DeployedAgents from "./agent/use/DeployedAgents";
import AgentChat from "./agent/use/AgentChat";
import AgentSettings from "./agent/use/AgentSettings";
import AgentUse from "./agent/use/AgentUse";
import Settings from "./setting/Settings";
import PackageManagerOverlay from "./agent/PackageManagerOverlay";
import AgentAuthGuard from "./agent/AgentAuthGuard";
import {
  useServerStore,
  useAuthStore,
  useUIStore,
  initializeStores,
} from "../stores";
import { usePlatformAPI } from "@/renderer/platform-api";
import { IconProgress } from "@tabler/icons-react";
import { postHogService } from "../services/posthog-service";
import WorkspaceManagement from "./workspace/WorkspaceManagement";
import WorkflowManager from "./workflow/WorkflowManager";

// Main App component
const App: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const platformAPI = usePlatformAPI();

  // Zustand stores
  const { refreshServers } = useServerStore();

  const { checkAuthStatus, subscribeToAuthChanges } = useAuthStore();

  const { packageManagerOverlay, setPackageManagerOverlay } = useUIStore();

  // Local state for loading and temporary UI states
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize stores
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize all stores
        await initializeStores();

        // Check authentication status
        await checkAuthStatus();

        // Initialize PostHog after getting settings
        const settings = await platformAPI.settings.get();
        postHogService.initialize({
          analyticsEnabled: settings.analyticsEnabled ?? true,
          userId: settings.userId,
        });
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [checkAuthStatus, platformAPI]);

  // Subscribe to authentication changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges();

    // Also subscribe to auth changes for PostHog
    const authUnsubscribe = platformAPI.auth.onChange(async (status) => {
      const settings = await platformAPI.settings.get();
      postHogService.updateConfig({
        analyticsEnabled: settings.analyticsEnabled ?? true,
        userId: status.authenticated ? status.userId : undefined,
      });
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, [subscribeToAuthChanges, platformAPI]);

  // Subscribe to protocol URL events
  useEffect(() => {
    const unsubscribe = platformAPI.packages.system.onProtocolUrl((url) => {
      handleProtocolUrl(url);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check package managers when navigating to agents pages
  useEffect(() => {
    const checkPackageManagersForAgents = async () => {
      // Check if we're on an agents page
      if (location.pathname.startsWith("/agents")) {
        try {
          const result = await platformAPI.packages.checkManagers();
          // Show overlay if either package manager is missing
          if (!result.pnpm || !result.uv) {
            setPackageManagerOverlay(true);
          } else {
            setPackageManagerOverlay(false);
          }
        } catch (error) {
          console.error("Failed to check package managers:", error);
        }
      } else {
        setPackageManagerOverlay(false);
      }
    };

    checkPackageManagersForAgents();
  }, [location.pathname, setPackageManagerOverlay]);

  // Handle package manager installation completion
  const handlePackageManagerInstallComplete = useCallback(() => {
    setPackageManagerOverlay(false);
  }, [setPackageManagerOverlay]);

  // Handle package manager overlay cancellation
  const handlePackageManagerCancel = useCallback(() => {
    setPackageManagerOverlay(false);
    // Navigate back to previous page or home
    navigate("/servers");
  }, [navigate, setPackageManagerOverlay]);

  // Handle protocol URL processing
  const handleProtocolUrl = useCallback(
    async (urlString: string) => {
      const url = new URL(urlString);
      try {
        if (url.hostname === "agent") {
          const agentId = url.searchParams.get("id");
          if (!agentId) {
            throw new Error("No agent ID provided in URL");
          }
          const result = await platformAPI.agents.import(agentId);
          if (result) {
            // Show success message for agent import
            toast.success("Agent successfully imported!", {
              description:
                "The shared agent has been added to your deployed agents.",
              duration: 5000,
            });
            // Navigate to agents/use page
            navigate("/agents/use");
          }
        } else if (url.hostname === "auth") {
          const token = url.searchParams.get("token");
          const state = url.searchParams.get("state");
          if (token && state) {
            await platformAPI.auth.handleToken(token, state);
            // Navigate to settings page
            navigate("/settings");
          }
        }
      } catch {
        if (url.hostname === "agent") {
          // Show please sign in error
          toast.error(t("Please sign in to import agents."));
          navigate("/settings");
        }
      }
    },
    [navigate, t],
  );

  // Refresh servers on initial load only
  useEffect(() => {
    refreshServers();
  }, [refreshServers]);

  // Loading indicator component to reuse
  const LoadingIndicator = () => (
    <div className="flex h-full items-center justify-center bg-content-light">
      <div className="text-center">
        <IconProgress className="h-10 w-10 mx-auto animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
      </div>
    </div>
  );

  // If still loading, show loading indicator
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Login is now optional - user can access app without authentication

  return (
    <SidebarProvider defaultOpen={true} className="h-full">
      <Sonner />

      {/* Package Manager Overlay */}
      <PackageManagerOverlay
        isOpen={packageManagerOverlay}
        onInstallComplete={handlePackageManagerInstallComplete}
        onCancel={handlePackageManagerCancel}
      />

      <SidebarComponent />
      <main className="flex flex-col flex-1 w-full min-w-0 overflow-auto">
        <div className="flex flex-col flex-1 pt-8">
          {/*<SidebarTrigger />*/}

          <Routes>
            {/* Public routes - no authentication required */}
            <Route element={<PageLayout />}>
              <Route path="/" element={<Navigate to="/servers" replace />} />
              <Route path="/servers" element={<Home />} />
              <Route path="/servers/add" element={<DiscoverWrapper />} />
              <Route path="/clients" element={<McpAppsManager />} />
              <Route path="/logs" element={<LogViewer />} />
              {/* Feedback removed: redirect */}
              <Route path="/feedback" element={<Navigate to="/servers" replace />} />
              {/* Agents feature removed: redirect any /agents path */}
              <Route path="/agents/*" element={<Navigate to="/servers" replace />} />
              <Route
                path="/hooks"
                element={<Navigate to="/workflows" replace />}
              />
              <Route path="/workflows" element={<WorkflowManager />} />
              <Route
                path="/workflows/:workflowId"
                element={<WorkflowManager />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/settings/workspaces"
                element={<WorkspaceManagement />}
              />
            </Route>

            {/* Agent routes - authentication required */}
            <Route
              path="/agents"
              element={
                <AgentAuthGuard>
                  <PageLayout />
                </AgentAuthGuard>
              }
            >
              <Route path="build" element={<AgentBuild />} />
              <Route path="build/edit/:id" element={<AgentCreate />} />
              <Route path="use" element={<DeployedAgents />} />
              <Route path="use/:id" element={<AgentUse />}>
                <Route path="chat" element={<AgentChat key="chat" />} />
                <Route
                  path="settings"
                  element={<AgentSettings key="settings" />}
                />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/servers" />} />
          </Routes>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default App;
