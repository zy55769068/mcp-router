<h1 align="center">MCP Router</h1>
<h3 align="center">A Unified MCP Server Management App</h3>

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/mcp-router/mcp-router?style=flat&logo=github&label=Star)](https://github.com/mcp-router/mcp-router)
[![Discord](https://img.shields.io/badge/Discord-Join%20Us-7289DA?style=flat&logo=discord)](https://discord.com/invite/dwG9jPrhxB)
[![X](https://img.shields.io/badge/X(Twitter)-@mcp__router-1DA1F2?style=flat&logo=x)](https://twitter.com/mcp_router)

[English | [日本語](https://github.com/mcp-router/mcp-router/blob/main/README_ja.md)]

</div>

## 🧭 Fork 来源与本仓库变更

本仓库为上游项目的派生版本（fork），仅在自用场景中维护，不会向上游发起 Pull Request。

- 上游来源：`https://github.com/mcp-router/mcp-router`
- 当前版本：与上游版本号一致（参见根目录 `package.json` 的 `version` 字段）

本仓库在“功能”方面的主要变更：

- 新增
  - 服务器工具管理：在服务器详情中可查看工具清单，并按服务器启用/禁用；运行时会严格拦截未被允许的工具调用。
  - 中文界面：新增简体中文本地化，并可在设置中切换语言。

- 调整
  - 导航与设置简化：移除“代理（Agents）”“反馈”“应用内更新安装”等入口；设置页移除登录/积分/社区/分析开关，聚焦本地使用体验；语言选择新增中文。
  - 路由调整：所有与代理相关的路由统一重定向到“服务器”，入口更聚焦。

- 移除/禁用
  - 代理相关能力（创建/构建/使用/聊天/会话/分享/部署/测试面板等）。
  - 账号体系与积分（登录、状态同步、余额展示等）。
  - 反馈提交与应用内主动更新安装。

## 🎯 Overview

**MCP Router** is a desktop application for simplifies the management of Model Context Protocol (MCP) servers.

### ✨ Key Features
- 🌐 **Universal** - Connect to any MCP server
  - Remote or local servers
  - Supports DXT, JSON, Manual
- 🖥️ **Cross-platform** - Available for Windows and macOS
- 🔒 **Privacy** - All data is stored locally on your device
- ⬆️ **Data portability** - Easily export and import your mcp configurations

## 🔒 Privacy & Security

### Your Data Stays Local
- ✅ **All data is stored locally** - Request logs, configurations, and server data remain on your device
- ✅ **Credentials are secure** - API keys and authentication credentials are stored locally and never transmitted externally
- ✅ **Complete control** - You have full control over your MCP server connections and data

### Transparency
- 🔍 **Auditable** - The desktop application source code is publicly available on GitHub
- 🛡️ **Verifiable privacy** - You can verify that your data stays local by examining the application code
- 🤝 **Community-driven** - Security improvements and audits are welcomed from the [community](https://discord.com/invite/dwG9jPrhxB)


## 📥 Installation

Download from our [installation page](http://mcp-router.net/install) or [releases page](https://github.com/mcp-router/mcp-router/releases).


## 🚀 Features

### 📊 Centralized Server Management
Easily toggle MCP servers on/off from a single dashboard

<img src="https://raw.githubusercontent.com/mcp-router/mcp-router/main/public/images/readme/toggle.png" alt="Server Management" width="600">

### 🌐 Universal Connectivity
Add and connect to any MCP server with support for both local and remote servers

<img src="https://raw.githubusercontent.com/mcp-router/mcp-router/main/public/images/readme/add-mcp-manual.png" alt="Universal Connectivity" width="600">

### 🔗 One-Click Integration
Seamlessly connect with popular AI tools like Claude, Cline, Windsurf, Cursor, or your custom client

<img src="https://raw.githubusercontent.com/mcp-router/mcp-router/main/public/images/readme/token.png" alt="One-Click Integration" width="600">

### 📈 Comprehensive Logging & Analytics
Monitor and display detailed request logs

<img src="https://raw.githubusercontent.com/mcp-router/mcp-router/main/public/images/readme/stats.png" alt="Logs and Statistics" width="600">


## 🤝 Community

Join our community to get help, share ideas, and stay updated:

- 💬 [Discord Community](https://discord.com/invite/dwG9jPrhxB)
- 🐦 [Follow us on X (Twitter)](https://twitter.com/mcp_router)
- ⭐ [Star us on GitHub](https://github.com/mcp-router/mcp-router)

## 📝 License

This project is licensed under the Sustainable Use License - see the [LICENSE.md](LICENSE.md) file for details.
