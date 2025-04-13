---
sidebar_position: 1
title: Getting Started with MCP and the MCP Router
---

## What Is MCP?

The Model Context Protocol (MCP) is a groundbreaking standard designed to extend the capabilities of large language models (LLMs). In simple terms, MCP functions like an “AI USB-C port” by providing a common interface for LLM-powered applications to connect with external data sources and tools. By integrating MCP into an LLM application, you can enhance its functionality across three key aspects:

- **Resources:** These provide additional information that the LLM can reference.
- **Tools:** These offer executable operations or functions that the LLM can invoke.
- **Prompts:** These are pre-defined instructions or templates that guide the LLM's response generation.

For instance, if you integrate an MCP server equipped with a “fetch” tool into an LLM application like Claude, Claude can autonomously use that tool to retrieve the latest news or updates.

What makes MCP particularly innovative is its ability to decouple model development from application development. In other words, model developers such as OpenAI and Anthropic can focus on building models optimized for an MCP-enabled ecosystem rather than competing over individual search or integration tools. Over the long term, this approach is expected to accelerate model development and deliver significant benefits to end users.

That being said, in the short term, while MCP undeniably enhances the capabilities of LLM applications and benefits users, there remain challenges in terms of security and user experience (UX). Currently, each application (like Cursor or Claude) independently installs and runs its own MCP server, and it is not always clear how these servers are actually being utilized. For MCP to become more widely adopted, it is essential to create a safe and user-friendly environment.

## Why Is the MCP Router Important?

To address the immediate safety and UX challenges that accompany MCP, the [MCP Router](https://mcp-router.net) was developed. The MCP Router is designed to significantly improve the overall MCP ecosystem by enhancing both security and user experience.

Without the MCP Router, each application manages its own MCP server separately, resulting in a fragmented environment. For example, without the MCP Router, the setup might look like this:

![](/img/tutorial/mcp-without-mcp-router.png)

However, when the MCP Router is used, the entire environment is unified and centrally managed, as illustrated below:

![](/img/tutorial/mcp-router-intro.png)

The MCP Router not only centralizes the management of MCP servers but also implements several important features, such as:

- **Access Control:** It determines which applications are permitted to use which MCP servers.
- **Log Management:** It automatically saves and visualizes usage logs.

By providing these functionalities, the MCP Router makes MCP integrations both safer and easier to manage—key steps toward wider adoption of the protocol.

## How to Use the MCP Router

Getting started is simple. Download the MCP Router application from [here](https://github.com/mcp-router/mcp-router/releases).

Once installed, you can use the MCP Router with all MCP-compatible applications—including Claude, Cursor, and Cline! The MCP Router supports an unlimited number of MCP server connections, including integrations with SaaS platforms like Zapier, cloud environments such as Cloudflare, and on-premises environments built by your own team.

### Installing and Launching an MCP Server

![](/img/tutorial/install-start.gif)

After downloading the MCP Router, navigate to the Discover page where you can install an MCP Server with just a single click. Simply press the **Start** button to execute the command needed to launch the MCP Server.

### Using an MCP Server Set Up via the MCP Router

![](/img/tutorial/auth.gif)

On the Token page, you can generate tokens for each application. Set the token as an environment variable using the following command:

```bash
export MCPR_TOKEN=<Your Token>
```

Then, connect to the MCP Router with:
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

