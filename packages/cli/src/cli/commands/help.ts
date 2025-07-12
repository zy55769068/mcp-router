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
    version   Show the CLI version
    help      Show this help message

  Connect Options:
    --host <host>   Specify the host (default: localhost)
    --port <port>   Specify the port (default: 3282)
  `);
}
