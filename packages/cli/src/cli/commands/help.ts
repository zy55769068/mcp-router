/**
 * Displays help information for the mcpr CLI
 */
export function executeHelp(): void {
  console.log(`
  MCPR CLI - Model Context Protocol Router Command Line Interface

  Usage:
    mcpr-cli <command> [options]

  Commands:
    connect   Connect to an MCP HTTP server
    serve     Start an HTTP server that forwards to a stdio MCP server
    version   Show the CLI version
    help      Show this help message

  Connect Options:
    --host <host>   Specify the host (default: localhost)
    --port <port>   Specify the port (default: 3282)

  Serve Options:
    --port <port>   HTTP server port (default: 3283)
    <command>       The stdio MCP server command to run
    [args...]       Arguments to pass to the MCP server

  Examples:
    mcpr-cli connect --host localhost --port 3282
    mcpr-cli serve --port 3283 npx @modelcontextprotocol/server-filesystem /path/to/dir
    mcpr-cli serve python my-mcp-server.py
  `);
}
