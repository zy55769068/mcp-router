import { app, BrowserWindow, session, shell } from "electron";
import path from "node:path";
import { MCPServerManager } from "@/main/modules/mcp-server-manager/mcp-server-manager";
import { AggregatorServer } from "@/main/modules/mcp-server-runtime/aggregator-server";
import { MCPHttpServer } from "@/main/modules/mcp-server-runtime/http/mcp-http-server";
import started from "electron-squirrel-startup";
import { setApplicationMenu } from "@/main/ui/menu";
import { createTray, updateTrayContextMenu } from "@/main/ui/tray";
import { importExistingServerConfigurations } from "@/main/modules/mcp-apps-manager/mcp-config-importer";
import { getPlatformAPIManager } from "@/main/modules/workspace/platform-api-manager";
import { getWorkspaceService } from "@/main/modules/workspace/workspace.service";
import { getSharedConfigManager } from "@/main/infrastructure/shared-config-manager";
import { setupIpcHandlers } from "./main/infrastructure/ipc";
import { getIsAutoUpdateInProgress } from "./main/modules/system/system-handler";
import {
  initializeEnvironment,
  isDevelopment,
  isProduction,
} from "@/main/utils/environment";

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // If we can't get the lock, it means another instance is running
  // Exit this instance, but the first instance will be notified via second-instance event
  app.exit();
}

// Listen for second instance launches and focus the existing window
app.on("second-instance", (_event, commandLine) => {
  // Show the app in the Dock on macOS
  if (process.platform === "darwin" && app.dock) {
    app.dock.show();
  }

  // Focus the existing window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow();
  }

  // Check for protocol URLs in the command line arguments
  // Protocol URLs would be the last argument in the command line
  const url = commandLine.find((arg) => arg.startsWith("mcpr://"));
  if (url) {
    handleProtocolUrl(url);
  }
});

// Squirrelの初回起動時の処理
if (started) app.quit();

// Global references
export let mainWindow: BrowserWindow | null = null;
export let backgroundWindow: BrowserWindow | null = null;
// Flag to track if app.quit() was explicitly called
let isQuitting = false;
// Timer for updating tray context menu
let trayUpdateTimer: NodeJS.Timeout | null = null;

export const BASE_URL = "https://mcp-router.net/";
// export const BASE_URL = 'http://localhost:3001/';
export const API_BASE_URL = `${BASE_URL}api`;

// Auto update disabled

// Declare global variables defined by Electron Forge
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string | undefined;
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const BACKGROUND_WINDOW_PRELOAD_WEBPACK_ENTRY: string | undefined;
declare const BACKGROUND_WINDOW_WEBPACK_ENTRY: string;

// グローバル変数の宣言（初期化は後で行う）
let serverManager: MCPServerManager;
let aggregatorServer: AggregatorServer;
let mcpHttpServer: MCPHttpServer;

// MCPServerManagerインスタンスを取得する関数をグローバルに公開
(global as any).getMCPServerManager = () => serverManager;
// AggregatorServerインスタンスを取得する関数をグローバルに公開
(global as any).getAggregatorServer = () => aggregatorServer;

const createWindow = () => {
  // Platform-specific window options
  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "MCP Router",
    icon: path.join(__dirname, "assets/icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDevelopment(),
    },
  };

  // Platform-specific title bar configuration
  if (process.platform === "darwin") {
    // macOS: hidden title bar with traffic light buttons
    windowOptions.titleBarStyle = "hidden";
    windowOptions.trafficLightPosition = { x: 20, y: 19 }; // y = (50-12)/2 ≈ 19 for vertical center
  } else if (process.platform === "win32") {
    // Windows: use titleBarOverlay for custom title bar
    windowOptions.titleBarStyle = "hidden";
    windowOptions.titleBarOverlay = {
      height: 50,
    };
  } else {
    // Linux: use default title bar
    windowOptions.frame = true;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle window close event - hide instead of closing completely
  mainWindow.on("close", (event) => {
    // If app.quit() was called explicitly (from tray menu) or auto-update is in progress, don't prevent the window from closing
    if (isQuitting || getIsAutoUpdateInProgress()) return;

    // Otherwise prevent the window from closing by default
    event.preventDefault();

    if (mainWindow) {
      // Just hide the window instead of closing it
      mainWindow.hide();

      // Hide the app from the Dock on macOS when window is closed
      if (process.platform === "darwin" && app.dock) {
        app.dock.hide();
      }
    }
  });

  // Handle actual window closed event if it occurs
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDevelopment()) {
    mainWindow.webContents.openDevTools();
  }
};

const createBackgroundWindow = () => {
  // Create the background window for agent chat processing
  backgroundWindow = new BrowserWindow({
    width: isProduction() ? 1 : 800,
    height: isProduction() ? 1 : 600,
    show: isDevelopment(), // Show during development for debugging
    frame: isDevelopment(),
    skipTaskbar: isProduction(),
    title: "Background Chat Window",
    webPreferences: {
      preload: BACKGROUND_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDevelopment(),
    },
  });

  // Load the background renderer
  backgroundWindow.loadURL(BACKGROUND_WINDOW_WEBPACK_ENTRY);

  backgroundWindow.on("closed", () => {
    backgroundWindow = null;
  });

  if (isDevelopment()) {
    // Open dev tools for debugging background window
    backgroundWindow.webContents.openDevTools();
  }
};

/**
 * Sets up a timer to periodically update the tray context menu
 * @param serverManager The MCPServerManager instance
 * @param intervalMs Time between updates in milliseconds
 */
function setupTrayUpdateTimer(
  serverManager: MCPServerManager,
  intervalMs = 5000,
) {
  if (trayUpdateTimer) {
    clearInterval(trayUpdateTimer);
  }

  trayUpdateTimer = setInterval(() => {
    updateTrayContextMenu(serverManager);
  }, intervalMs);
}

/**
 * データベースの初期化を行う
 */
async function initDatabase(): Promise<void> {
  try {
    // 共通設定マネージャーを初期化（既存データからのマイグレーションを含む）
    await getSharedConfigManager().initialize();

    // ワークスペースサービスは自動的にメタデータベースを初期化する
    const workspaceService = getWorkspaceService();

    // アクティブなワークスペースを取得
    const activeWorkspace = await workspaceService.getActiveWorkspace();
    if (!activeWorkspace) {
      // デフォルトワークスペースがない場合は作成
      await workspaceService.switchWorkspace("local-default");
    }

    // ワークスペース固有のデータベースのマイグレーションは
    // PlatformAPIManagerが初期化時に実行する
  } catch (error) {
    console.error(
      "データベースマイグレーション中にエラーが発生しました:",
      error,
    );
  }
}

/**
 * MCP関連サービスの初期化を行う
 */
async function initMCPServices(): Promise<void> {
  // Platform APIマネージャーの初期化（ワークスペースDBを設定）
  await getPlatformAPIManager().initialize();

  // MCPServerManagerの初期化
  serverManager = new MCPServerManager();

  // データベースからサーバーリストを読み込む
  await serverManager.initializeAsync();

  // AggregatorServerの初期化
  aggregatorServer = new AggregatorServer(serverManager);
  aggregatorServer.initAgentToolsServer();

  // HTTPサーバーの初期化とスタート
  mcpHttpServer = new MCPHttpServer(serverManager, 3282, aggregatorServer);
  try {
    await mcpHttpServer.start();
  } catch (error) {
    console.error("Failed to start MCP HTTP Server:", error);
  }

  // 既存のMCPサーバー設定をインポート
  await importExistingServerConfigurations();
}

/**
 * ユーザーインターフェース関連の初期化を行う
 */
function initUI(): void {
  // メインウィンドウ作成
  createWindow();

  // Platform APIマネージャーにメインウィンドウを設定
  if (mainWindow) {
    getPlatformAPIManager().setMainWindow(mainWindow);
  }

  // バックグラウンドウィンドウ作成
  createBackgroundWindow();

  // システムトレイ作成
  createTray(serverManager);

  // トレイコンテキストメニューの定期更新を設定
  setupTrayUpdateTimer(serverManager);
}

/**
 * アプリケーション全体の初期化を行う
 */
async function initApplication(): Promise<void> {
  // 環境設定を初期化
  initializeEnvironment();
  const DEV_CSP = `
    default-src 'self' 'unsafe-inline' http://localhost:* ws://localhost:*;
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    connect-src 'self' http://localhost:* ws://localhost:* https://mcp-router.net https://staging.mcp-router.net https://us.i.posthog.com https://us-assets.i.posthog.com;
    img-src 'self' data:;
  `
    .replace(/\s+/g, " ")
    .trim();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [DEV_CSP],
      },
    });
  });

  // アプリケーション名を設定
  app.setName("MCP Router");

  // アプリケーションメニューを設定
  setApplicationMenu();

  // システム起動時の自動起動を設定
  if (!app.getLoginItemSettings().openAtLogin) {
    app.setLoginItemSettings({
      openAtLogin: true,
    });
  }

  // データベース初期化
  await initDatabase();

  // MCPサービス初期化
  await initMCPServices();

  // IPC通信ハンドラの初期化
  setupIpcHandlers();

  // UI初期化
  initUI();
}

app.on("ready", initApplication);

// Keep the app running when all windows are closed
// The app will continue to run in the background with only the tray icon visible
app.on("window-all-closed", () => {
  // Don't quit the app regardless of platform
  // The app will remain active with the tray icon
  if (process.platform === "darwin" && app.dock) {
    app.dock.hide(); // Hide from dock when all windows are closed
  }
  // console.log('All windows closed, app continues running in the background');
});

app.on("activate", () => {
  // Show the app in the Dock on macOS when activated
  if (process.platform === "darwin" && app.dock) {
    app.dock.show();
  }

  // Re-create a window if there are no windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    if (mainWindow && mainWindow.isMinimized()) mainWindow.restore();
    if (mainWindow) mainWindow.show();
    if (mainWindow) mainWindow.focus();
  }
});

// Register the app as default handler for mcpr:// protocol
app.whenReady().then(() => {
  app.setAsDefaultProtocolClient("mcpr");
});

// Handle the mcpr:// protocol on macOS
app.on("open-url", (event, url) => {
  event.preventDefault();

  // Store the URL to be processed after app is ready if needed
  const processUrl = () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else if (app.isReady()) {
      createWindow();
    } else {
      // If app is not ready yet, wait until it is before creating the window
      app.whenReady().then(() => {
        createWindow();
        // Process the URL after the window is created
        handleProtocolUrl(url);
      });
      return; // Return early to avoid processing URL twice
    }
    handleProtocolUrl(url);
  };

  processUrl();
});

// Clean up when quitting
app.on("will-quit", async () => {
  // Clear the tray update timer
  if (trayUpdateTimer) {
    clearInterval(trayUpdateTimer);
    trayUpdateTimer = null;
  }
  // Stop the HTTP server
  try {
    await mcpHttpServer.stop();
  } catch (error) {
    console.error("Failed to stop MCP HTTP Server:", error);
  }

  serverManager.shutdown();
  aggregatorServer.shutdown();
});

// Override the default app.quit to set our isQuitting flag first
const originalQuit = app.quit;
app.quit = function (...args) {
  // Set the flag to allow the window to close
  isQuitting = true;
  // Call the original quit method
  return originalQuit.apply(this, args);
};

// Process protocol URLs (mcpr://) - replaces the old protocol.registerHttpProtocol handler
export async function handleProtocolUrl(urlString: string) {
  try {
    if (mainWindow) {
      mainWindow.webContents.send("protocol:url", urlString);
    }
  } catch (error) {
    console.error("Failed to process protocol URL:", error);
  }
}
