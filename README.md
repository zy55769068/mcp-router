# MCP Router

[English | [日本語](README_ja.md)]


MCP Router is a free Windows and MacOS app that allows you to manage multiple MCP servers from a single interface with secure access control and logging. No login required. It supports both local and remote MCP servers and can connect to any MCP server from any registry (Zapier, Smithy, etc).
English and Japanese languages are supported.

## Features
**Manage multiple MCP servers with ease**
![](/static/img/readme/toggle.png)

**View detailed logs and request statistics**
![](/static/img/readme/stats.png)

**One-Click integration to Claude, Cline, Windsurf, Cursor, or your custom client**
![](/static/img/readme/token.png)

**Connect to any MCP server**
![](/static/img/readme/add-mcp-manual.png)

## How to Use

### Install MCP Router
Download the latest MCP Router from the [releases](https://github.com/mcp-router/mcp-router/releases) page.

Currently, the app requires an activation code (please ask a friend for an invitation) to use.

### Start MCP Server
Add your preferred MCP servers from the Servers menu in the top right corner.
You can add servers from a JSON file or select from the registry of MCP servers provided by MCP Router.

### Use MCP Router
From your MCP app, access using the following command:

```bash
set MCPR_TOKEN=<Your Token>
npx -y mcpr-cli connect
```
または
```json
{
  "mcpServers": {
    "mcp-router": {
      "command": "npx",
      "args": [
        "-y",
        "mcpr-cli",
        "connect"
      ],
      "env": {
        "MCPR_TOKEN": "Issued Token"
      }
    }
  }
}
```

リクエストのログは自動でローカルに記録されます（外部には送信されません）。



