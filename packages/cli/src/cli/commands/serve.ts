import { createServer, IncomingMessage, ServerResponse } from "http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  ErrorCode,
  InitializeRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  CallToolRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

/**
 * Executes the serve command, starting an HTTP server that accepts
 * Streamable HTTP MCP requests and forwards them to a stdio-based MCP server.
 */
export async function executeServe(args: string[] = []): Promise<void> {
  const options = parseArgs(args);

  // Create and start the Stdio MCP Bridge Server
  const bridgeServer = new StdioMcpBridgeServer(options);
  await bridgeServer.start();

  // Keep the process running until interrupted
  process.on("SIGINT", async () => {
    await bridgeServer.stop();
    process.exit(0);
  });
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): {
  port: number;
  command: string;
  args: string[];
  verbose?: boolean;
} {
  const options = {
    port: 3283,
    command: "",
    args: [] as string[],
    verbose: false,
  };

  let i = 0;
  while (i < args.length) {
    if (args[i] === "--port" && i + 1 < args.length) {
      options.port = parseInt(args[i + 1], 10);
      i += 2;
    } else if (args[i] === "--verbose" || args[i] === "-v") {
      options.verbose = true;
      i++;
    } else if (args[i] === "--") {
      // Everything after -- is the command and its arguments
      options.command = args[i + 1];
      options.args = args.slice(i + 2);
      break;
    } else {
      // First non-option argument is the command
      options.command = args[i];
      options.args = args.slice(i + 1);
      break;
    }
  }

  if (!options.command) {
    throw new Error(
      "No command specified. Usage: mcpr-cli serve [--port <port>] [--verbose] <command> [args...]",
    );
  }

  return options;
}

/**
 * HTTP to Stdio MCP Bridge Server
 *
 * This class creates an HTTP server that accepts Streamable HTTP MCP requests
 * and forwards them to a stdio-based MCP server process.
 */
class StdioMcpBridgeServer {
  private httpServer: ReturnType<typeof createServer> | null = null;
  private mcpClient: Client | null = null;

  constructor(
    private options: {
      port: number;
      command: string;
      args: string[];
      verbose?: boolean;
    },
  ) {}

  /**
   * Starts the HTTP server and connects to the stdio MCP server
   */
  async start(): Promise<void> {
    // Start the stdio MCP server process
    await this.startStdioServer();

    // Create HTTP server
    this.httpServer = createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });

    // Start listening
    this.httpServer.listen(this.options.port, () => {
      console.error(
        `HTTP MCP Bridge Server listening on port ${this.options.port}`,
      );
      console.error(
        `Forwarding requests to: ${this.options.command} ${this.options.args.join(" ")}`,
      );
    });
  }

  /**
   * Stops the server and cleans up resources
   */
  async stop(): Promise<void> {
    console.error("Stopping HTTP MCP Bridge Server...");

    if (this.httpServer) {
      this.httpServer.close();
    }

    if (this.mcpClient) {
      await this.mcpClient.close();
    }
  }

  /**
   * Starts the stdio MCP server process and connects to it
   */
  private async startStdioServer(): Promise<void> {
    // Create stdio transport (it will spawn the process internally)
    const transport = new StdioClientTransport({
      command: this.options.command,
      args: this.options.args,
    });

    // Create MCP client
    this.mcpClient = new Client(
      {
        name: "mcp-router-http-bridge",
        version: "0.1.0",
      },
      {
        capabilities: {},
      },
    );

    // Connect to the stdio server
    await this.mcpClient.connect(transport);
  }

  /**
   * Handles incoming HTTP requests and forwards them to the stdio MCP server
   */
  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Only accept POST requests to /mcp
    if (req.method !== "POST" || req.url !== "/mcp") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    let request: any = null;
    try {
      // Parse request body
      const body = await this.parseRequestBody(req);
      request = JSON.parse(body);

      // Log incoming request for debugging
      if (this.options.verbose) {
        console.log("[serve] Incoming request:", JSON.stringify(request, null, 2));
      }

      // Handle different request types
      let result: any;

      switch (request.method) {
        case "initialize":
          result = await this.handleInitialize(request);
          break;
        case "tools/list":
          result = await this.handleListTools(request);
          break;
        case "tools/call":
          result = await this.handleCallTool(request);
          break;
        case "resources/list":
          result = await this.handleListResources(request);
          break;
        case "resources/templates/list":
          result = await this.handleListResourceTemplates(request);
          break;
        case "resources/read":
          result = await this.handleReadResource(request);
          break;
        case "prompts/list":
          result = await this.handleListPrompts(request);
          break;
        case "prompts/get":
          result = await this.handleGetPrompt(request);
          break;
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown method: ${request.method}`,
          );
      }

      // Send response
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: request.id,
          result,
        }),
      );
    } catch (error) {
      // Send error response
      let errorCode = ErrorCode.InternalError;
      let errorMessage = "Unknown error";
      let errorData = undefined;

      if (error instanceof z.ZodError) {
        errorCode = ErrorCode.InvalidParams;
        errorMessage = "Invalid request parameters";
        errorData = error.errors;
        // Log validation error for debugging
        console.error("[serve] Schema validation error:", JSON.stringify(error.errors, null, 2));
      } else if (error instanceof McpError) {
        errorCode = error.code;
        errorMessage = error.message;
        errorData = error.data;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorResponse = {
        jsonrpc: "2.0",
        id: request?.id || null,
        error: {
          code: errorCode,
          message: errorMessage,
          data: errorData,
        },
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(errorResponse));
    }
  }

  /**
   * Parse request body
   */
  private parseRequestBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        resolve(body);
      });
      req.on("error", reject);
    });
  }

  /**
   * Handle initialize request
   */
  private async handleInitialize(request: any): Promise<any> {
    const params = InitializeRequestSchema.parse({
      jsonrpc: "2.0",
      method: "initialize",
      params: request.params
    });
    
    return {
      protocolVersion: params.params.protocolVersion || "2024-10-07",
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
      serverInfo: {
        name: "mcp-router-http-bridge",
        version: "0.1.0",
      },
    };
  }

  /**
   * Handle list tools request
   */
  private async handleListTools(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = ListToolsRequestSchema.parse(request.params || {});
    return await this.mcpClient.listTools(params);
  }

  /**
   * Handle call tool request
   */
  private async handleCallTool(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = CallToolRequestSchema.parse({
      jsonrpc: "2.0",
      method: "tools/call",
      params: request.params
    });
    return await this.mcpClient.callTool(params.params);
  }

  /**
   * Handle list resources request
   */
  private async handleListResources(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = ListResourcesRequestSchema.parse(request.params || {});
    return await this.mcpClient.listResources(params);
  }

  /**
   * Handle list resource templates request
   */
  private async handleListResourceTemplates(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = ListResourceTemplatesRequestSchema.parse(
      request.params || {},
    );
    return await this.mcpClient.listResourceTemplates(params);
  }

  /**
   * Handle read resource request
   */
  private async handleReadResource(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = ReadResourceRequestSchema.parse({
      jsonrpc: "2.0",
      method: "resources/read",
      params: request.params
    });
    return await this.mcpClient.readResource(params.params);
  }

  /**
   * Handle list prompts request
   */
  private async handleListPrompts(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = ListPromptsRequestSchema.parse(request.params || {});
    return await this.mcpClient.listPrompts(params);
  }

  /**
   * Handle get prompt request
   */
  private async handleGetPrompt(request: any): Promise<any> {
    if (!this.mcpClient) {
      throw new McpError(ErrorCode.InternalError, "MCP client not initialized");
    }

    const params = GetPromptRequestSchema.parse({
      jsonrpc: "2.0",
      method: "prompts/get",
      params: request.params
    });
    return await this.mcpClient.getPrompt(params.params);
  }
}
