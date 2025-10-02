import React, { useEffect, useMemo, useState } from "react";
import { MCPServer, MCPTool, PlatformAPI } from "@mcp_router/shared";
import { usePlatformAPI } from "@/renderer/platform-api/hooks/use-platform-api";
import { Switch, Badge, Input, Button } from "@mcp_router/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mcp_router/ui";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  server: MCPServer;
}

const ServerDetailsTools: React.FC<Props> = ({ server }) => {
  const platformAPI = usePlatformAPI() as PlatformAPI;
  const { t } = useTranslation();
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const compare = (a: MCPTool, b: MCPTool) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    const base = !search.trim()
      ? tools
      : tools.filter((t) =>
          t.name.toLowerCase().includes(search.toLowerCase()),
        );
    return [...base].sort(compare);
  }, [tools, search]);

  const fetchTools = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await platformAPI.servers.tools.list(server.id);
      // 保留描述/Schema，但默认不展示，仅在展开时显示
      setTools(
        list.map((t) => ({
          name: t.name,
          enabled: t.enabled !== false,
          description: t.description,
          inputSchema: t.inputSchema || t["parameters" as keyof typeof t],
        })) as MCPTool[],
      );
    } catch (e: any) {
      setError(e?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  const onToggle = async (toolName: string, enabled: boolean) => {
    const updated = tools.map((t) => (t.name === toolName ? { ...t, enabled } : t));
    setTools(updated);

    const permissions: Record<string, boolean> = {};
    updated.forEach((t) => (permissions[t.name] = t.enabled !== false));

    try {
      await platformAPI.servers.tools.updatePermissions(server.id, permissions);
    } catch (e) {
      // 回滚
      setTools(tools);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={t("serverDetails.toolsPanel.filterPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
        <Badge variant="outline">{filtered.length}</Badge>
      </div>

      {loading && (
        <div className="text-xs text-muted-foreground">{t("common.loading")}</div>
      )}
      {error && <div className="text-xs text-destructive">{error}</div>}

      {!loading && !error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="w-[60%] text-xs">{t("serverDetails.toolsPanel.toolHeader")}</TableHead>
                <TableHead className="text-right w-[40%] text-xs">{t("serverDetails.toolsPanel.enabledHeader")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tool) => (
                <>
                  <TableRow key={tool.name} className="h-8">
                    <TableCell className="py-1 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-6 w-6 transition-transform ${
                            expanded[tool.name] ? "rotate-180" : ""
                          }`}
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [tool.name]: !prev[tool.name],
                            }))
                          }
                          aria-label={expanded[tool.name]
                            ? t("serverDetails.toolsPanel.collapse")
                            : t("serverDetails.toolsPanel.expand")}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        {tool.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      <Switch
                        checked={tool.enabled !== false}
                        onCheckedChange={(v) => onToggle(tool.name, !!v)}
                      />
                    </TableCell>
                  </TableRow>
                  {expanded[tool.name] && (
                    <TableRow>
                      <TableCell colSpan={2} className="py-2">
                        {tool.description && (
                          <div className="text-sm mb-2">{tool.description}</div>
                        )}
                        {tool.inputSchema && (
                          <pre className="text-xs font-mono overflow-x-auto bg-muted/30 p-2 rounded">
                            {JSON.stringify(tool.inputSchema, null, 2)}
                          </pre>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-2 text-center text-xs text-muted-foreground">
                    {t("serverDetails.toolsPanel.noTools")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ServerDetailsTools;
