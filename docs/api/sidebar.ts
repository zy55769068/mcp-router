import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/mcp-router-api",
    },
    {
      type: "category",
      label: "logs",
      link: {
        type: "doc",
        id: "api/logs",
      },
      items: [
        {
          type: "doc",
          id: "api/get-logs",
          label: "Get logs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/get-log-statistics",
          label: "Get log statistics",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/get-available-client-i-ds",
          label: "Get available client IDs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/get-available-request-types",
          label: "Get available request types",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/get-log-by-id",
          label: "Get log by ID",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "servers",
      link: {
        type: "doc",
        id: "api/servers",
      },
      items: [
        {
          type: "doc",
          id: "api/start-mcp-server",
          label: "Start MCP server",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stop-mcp-server",
          label: "Stop MCP server",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/remove-mcp-server",
          label: "Remove MCP server",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/list-mcp-servers",
          label: "List MCP servers",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/add-new-mcp-servers-from-json-configuration",
          label: "Add new MCP servers from JSON configuration",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "apps",
      link: {
        type: "doc",
        id: "api/apps",
      },
      items: [
        {
          type: "doc",
          id: "api/list-mcp-apps",
          label: "List MCP apps",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "mcp",
      link: {
        type: "doc",
        id: "api/mcp",
      },
      items: [
        {
          type: "doc",
          id: "api/process-mcp-request-streamable-http",
          label: "Process MCP request (Streamable HTTP)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/establish-server-sent-events-connection-for-mcp",
          label: "Establish Server-Sent Events connection for MCP",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/send-mcp-message-via-sse-connection",
          label: "Send MCP message via SSE connection",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
