import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router.js";
import { createContext } from "./trpc.js";
import { serversStore } from "./data/servers.js";
import { logsStore } from "./data/logs.js";

const app = express();

// Enable CORS
app.use(cors());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mount tRPC router
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

// Initialize with sample data
function initializeSampleData() {
  // Create sample servers
  const server1 = serversStore.create({
    name: "OpenAI Server",
    serverType: "remote",
    remoteUrl: "https://api.openai.com/v1",
    bearerToken: "sk-sample-key",
    env: {
      OPENAI_API_KEY: "sk-sample-key",
    },
  });

  const server2 = serversStore.create({
    name: "Local Python Server",
    serverType: "local",
    command: "python",
    args: ["-m", "mcp_server"],
    env: {},
  });

  // Add sample logs
  logsStore.addSampleLog(server1.id, server1.name, "success");
  logsStore.addSampleLog(server1.id, server1.name, "success");
  logsStore.addSampleLog(server2.id, server2.name, "error");
  logsStore.addSampleLog(server2.id, server2.name, "success");

  console.log("✅ Sample data initialized");
}

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`🚀 Mock Remote API server running on http://localhost:${PORT}`);
  console.log(`📡 tRPC endpoint: http://localhost:${PORT}/api/trpc`);
  console.log(`🔑 Use Authorization header: Bearer mock-token`);

  initializeSampleData();
});
