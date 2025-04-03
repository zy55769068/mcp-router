---
sidebar_position: 1
---

# Introduction

Get to know MCP Router in under 5 minutes.

## Getting Started
MCP Router is a powerful tool that makes managing your MCP Server a breeze.
With its user-friendly interface and a variety of features, it’s designed to enhance your MCP experience.

![](/img/tutorial/mcp-router-intro.png)

Download the app [here](https://github.com/mcp-router/mcp-router/releases) to get started.

It’s incredibly simple to use and works with every MCP-compatible application (including Claude, Cursor, and Cline)!

## How to Use MCP Router

### Installing and Launching the MCP Server

![](/img/tutorial/install-start.gif)

After downloading MCP Router, you can install the MCP Server with just one click from the Discover page.

Simply click the Start button to execute the command for your installed MCP Server.

### Using the MCP Server Set Up by MCP Router

![](/img/tutorial/auth.gif)

On the Token page, generate a token for each application.

Set the token as an environment variable to use MCP Router:

```bash
export MCPR_TOKEN=<Your Token>
```
Then, connect to MCP Router using the command below:

```bash
npx mcpr-cli connect
```

Make sure MCP Router is running before attempting to connect.

### Viewing Request Logs

![](/img/tutorial/logs.gif)

MCP Router automatically saves logs.
These logs are displayed in chronological order.

### Adding an MCP Server

![](/img/tutorial/mcp-router-server.gif)

With MCP Router, you can easily add MCP Servers registered on mcp-router.net.
Registering your server on mcp-router.net is simple.

