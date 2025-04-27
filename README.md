# MCP Router: A Unified MCP Management App

[English | [日本語](README_ja.md)]

![](/static/img/readme/intro.gif)

MCP Router is a free Windows and MacOS app that allows you to manage MCP servers from a single interface with secure access control and logging.

It supports both local and remote MCP servers and can connect to any MCP server from any registry (Zapier, Smithy, etc).

No login required.
English and Japanese are supported.


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
or
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

Request logs are saved locally (not sent externally).

