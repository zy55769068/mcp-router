import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@mcp_router/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mcp_router/ui";
import { Button } from "@mcp_router/ui";
import { Badge } from "@mcp_router/ui";
import { Switch } from "@mcp_router/ui";
import { useThemeStore } from "@/renderer/stores";
import { useAuthStore } from "../../stores";
import { electronPlatformAPI as platformAPI } from "../../platform-api/electron-platform-api";
// Analytics UI removed from Settings; keep service wiring elsewhere (App)

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false);
  const [loadExternalMCPConfigs, setLoadExternalMCPConfigs] =
    useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Zustand stores
  const { theme, setTheme } = useThemeStore();
  const {
    isAuthenticated,
    userInfo,
    isLoggingIn,
    login,
    logout,
    checkAuthStatus,
    subscribeToAuthChanges,
  } = useAuthStore();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  // Get normalized language code for select
  const getCurrentLanguage = () => {
    const lang = i18n.language || "en";
    if (lang.startsWith("zh")) return "zh";
    if (lang.startsWith("ja")) return "ja";
    return "en";
  };

  // 認証状態の監視
  useEffect(() => {
    // 初期状態を確認
    checkAuthStatus();

    // 認証状態の変更を監視
    const unsubscribe = subscribeToAuthChanges();

    return () => {
      unsubscribe();
    };
  }, [checkAuthStatus, subscribeToAuthChanges]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await platformAPI.settings.get();
        setLoadExternalMCPConfigs(settings.loadExternalMCPConfigs ?? true);
      } catch {
        // Ignore error and use default value
        console.log("Failed to load settings, using defaults");
      }
    };
    loadSettings();
  }, []);

  // Settingsページ表示時にクレジット残高を更新
  useEffect(() => {
    if (isAuthenticated) {
      // ページが表示された時に一回だけクレジット残高を更新
      const refreshCredits = async () => {
        try {
          await checkAuthStatus(true);
        } catch (error) {}
      };

      refreshCredits();
    }
  }, [isAuthenticated, checkAuthStatus]);

  // ログイン処理
  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("ログインに失敗しました:", error);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  };

  // クレジット残高の更新処理
  const handleRefreshCredits = async () => {
    if (!isAuthenticated || isRefreshingCredits) return;

    try {
      setIsRefreshingCredits(true);
      await checkAuthStatus(true); // Force refresh
    } catch (error) {
      console.error("クレジット残高の更新に失敗しました:", error);
    } finally {
      setIsRefreshingCredits(false);
    }
  };

  // Handle external MCP configs toggle
  const handleExternalMCPConfigsToggle = async (checked: boolean) => {
    setLoadExternalMCPConfigs(checked);
    setIsSavingSettings(true);

    try {
      const currentSettings = await platformAPI.settings.get();
      await platformAPI.settings.save({
        ...currentSettings,
        loadExternalMCPConfigs: checked,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Revert on error
      setLoadExternalMCPConfigs(!checked);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Analytics toggle removed from UI

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{t("common.settings")}</h1>

      {/* Appearance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("settings.appearance")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("common.language")}
            </label>
            <div className="flex flex-1 min-w-[220px]">
              <Select
                value={getCurrentLanguage()}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder={t("common.language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("languages.en")}</SelectItem>
                  <SelectItem value="ja">{t("languages.ja")}</SelectItem>
                  <SelectItem value="zh">{t("languages.zh")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("settings.theme")}</label>
            <div className="flex flex-1 min-w-[220px]">
              <Select
                value={theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  setTheme(value)
                }
              >
                <SelectTrigger id="theme" className="w-full">
                  <SelectValue placeholder={t("settings.theme")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t("settings.themeLight")}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t("settings.themeDark")}
                  </SelectItem>
                  <SelectItem value="system">
                    {t("settings.themeSystem")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication removed */}
      {false && (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("settings.authentication")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">
                      {t("settings.loggedInAs")}:
                    </p>
                    <span className="font-medium">
                      {userInfo?.name || userInfo?.userId}
                    </span>
                  </div>
                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    disabled={isLoggingIn}
                    className="text-xs px-3 py-1"
                  >
                    {isLoggingIn
                      ? t("settings.loggingOut")
                      : t("settings.logout")}
                  </Button>
                </div>
              </div>

              {/* Credit Balance Section */}
              <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {t("settings.creditBalance")}:
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshCredits}
                      disabled={isRefreshingCredits}
                      className="h-6 px-2 text-xs"
                    >
                      {isRefreshingCredits
                        ? t("settings.refreshingCredits")
                        : t("settings.refreshCredits")}
                    </Button>
                  </div>
                  <Badge variant="default" className="font-medium text-sm">
                    {(userInfo?.creditBalance || 0) +
                      (userInfo?.paidCreditBalance || 0)}{" "}
                    {t("settings.credits")}
                  </Badge>
                </div>

                {/* Free Credits Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t("settings.freeCredits")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-sm border-green-300 text-green-700 dark:text-green-300"
                    >
                      {userInfo?.creditBalance || 0}
                    </Badge>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {t("settings.freeCreditsDescription")}
                  </p>
                </div>

                {/* Paid Credits Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {t("settings.paidCredits")}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-sm border-blue-300 text-blue-700 dark:text-blue-300"
                    >
                      {userInfo?.paidCreditBalance || 0}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      window.open("https://mcp-router.net/profile", "_blank");
                    }}
                  >
                    {t("settings.purchaseCredits")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("settings.loginOptionalDescription")}
              </p>
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn ? t("settings.loggingIn") : t("settings.login")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Community Card removed */}

      {/* External Applications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("settings.advanced")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">
                {t("settings.loadExternalMCPConfigs")}
              </label>
              <p className="text-xs text-muted-foreground">
                {t("settings.loadExternalMCPConfigsDescription")}
              </p>
            </div>
            <Switch
              checked={loadExternalMCPConfigs}
              onCheckedChange={handleExternalMCPConfigsToggle}
              disabled={isSavingSettings}
            />
          </div>
          {/* Analytics toggle removed */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
