# mcpr-cli

Command-line interface for the MCP Router - connect to a running MCP HTTP server via the command line.

## Are you new here?

If you're new to MCP Router:

1. First, download and install the MCP Router application from [our website](https://mcp-router.net)
2. Start the MCP Router application and ensure it's running properly
3. Then, usually this cli is installed as part of the MCP Router installation, but if you want to install it separately, you can do so using npm


## Usage

```bash
export MCPR_TOKEN=your_access_token
# Connect to a local MCP Router
npx mcpr-cli connect

# Connect to a specific host and port
npx mcpr-cli connect --host example.com --port 3000

# Display help
npx mcpr-cli help
```

