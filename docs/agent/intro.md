---
sidebar_position: 2
title: Getting Started with AI Agents
---


## AI Agent feature of MCP Router
With MCP Router, you can easily create AI agents that utilize MCP servers.
AI agents are AI-driven systems designed to automate specific tasks or provide information based on user requests. Using MCP Router provides the following benefits:

- **Simple Setup**: Just install MCP Router and immediately start using AI agents.
- **Integration with Various MCP Servers**: Easily build AI agents using your existing MCP servers.
- **Enhanced Security and Privacy**: MCP operates locally, so authentication tokens and sensitive data are stored locally, improving security.
- **User-Friendly Interface**: Intuitive screens and straightforward operations make managing and configuring your AI agents easy.
- **Share Created AI Agents**: Easily share the AI agents you've developed with other users.

## Package Manager Installation
MCP Router includes built-in commands to install necessary package managers (such as pnpm or uvx) required for MCP operations.
This functionality allows even general users to quickly and easily begin using AI agents.

However, security policies in your operating system might restrict the execution of these commands.
In such cases, follow the manual setup steps below:

For MacOS, open the Terminal app and run the following commands:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
pnpm env use --global lts
```

For Windows, open the PowerShell app and run the following commands:
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
pnpm env use --global lts
```


