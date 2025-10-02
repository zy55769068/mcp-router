import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Simple inline SVG icons to avoid extra deps
const IconServer = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true" {...props}>
    <rect x="3" y="4" width="18" height="8" rx="2"/>
    <rect x="3" y="12" width="18" height="8" rx="2"/>
    <path d="M7 8h.01M7 16h.01"/>
  </svg>
);
const IconMonitor = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true" {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);
const IconActivity = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true" {...props}>
    <path d="M22 12h-4l-3 7-6-14-3 7H2"/>
  </svg>
);
const IconSettings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true" {...props}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.06 4h0A1.65 1.65 0 0 0 9.57 3H9.66a2 2 0 1 1 4 0h.09a1.65 1.65 0 0 0 1.51 1h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82h0A1.65 1.65 0 0 0 21 9.57V9.66a2 2 0 1 1 0 4v.09a1.65 1.65 0 0 0-1.6 1.26Z"/>
  </svg>
);

function Brand() {
  return (
    <div className="flex items-center gap-2 mb-2 px-2">
      <div className="text-base font-semibold">MCP Router</div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={open ? "rotate-180 transition-transform" : "transition-transform"}>
      <path d="M6 9l6 6 6-6"/>
    </svg>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm " +
        (active ? "bg-muted font-medium" : "hover:bg-muted/60")
      }
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const [mcpOpen, setMcpOpen] = useState(true);
  return (
    // Add top padding to avoid being overlapped by the fixed TitleBar (h-[50px])
    <aside className="w-64 shrink-0 border-r h-full overflow-y-auto p-2 pt-[50px]">
      <Brand />

      {/* MCP group (collapsible) */}
      <button
        className="w-full flex items-center justify-between px-2 py-1 text-xs uppercase text-muted-foreground"
        onClick={() => setMcpOpen((v) => !v)}
        aria-expanded={mcpOpen}
      >
        <span>MCP</span>
        <Chevron open={mcpOpen} />
      </button>
      {mcpOpen && (
        <nav className="space-y-1 mb-6 mt-1">
          <NavItem to="/servers" icon={<IconServer />} label={t("home.servers", "MCP 服务器")} />
          <NavItem to="/clients" icon={<IconMonitor />} label={t("home.clients", "MCP 应用集成")} />
          <NavItem to="/logs" icon={<IconActivity />} label={t("logs.title", "请求日志")} />
        </nav>
      )}

      <div className="mt-auto pt-2 border-t" />
      <nav className="space-y-1 mt-3">
        <NavItem to="/settings" icon={<IconSettings />} label={t("settings.title", "设置")} />
      </nav>

      {/* Agents 与 Feedback 已移除，不再显示 */}
    </aside>
  );
}
