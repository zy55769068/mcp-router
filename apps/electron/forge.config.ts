import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import { MakerDMG } from "@electron-forge/maker-dmg";
import * as path from "path";
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Derive repository owner/name from GitHub Actions env when available
const repoEnv = process.env.GITHUB_REPOSITORY;
const [repoOwner, repoName] = repoEnv ? repoEnv.split("/") : ["mcp-router", "mcp-router"];

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "./public/images/icon/icon",
    // Only sign/notarize when credentials are provided; otherwise disabled for CI builds
    osxSign: process.env.PUBLIC_IDENTIFIER
      ? {
          identity: process.env.PUBLIC_IDENTIFIER,
        }
      : undefined,
    osxNotarize:
      process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID && process.env.APPLE_API_ISSUER
        ? {
            appleApiKey: process.env.APPLE_API_KEY,
            appleApiKeyId: process.env.APPLE_API_KEY_ID,
            appleApiIssuer: process.env.APPLE_API_ISSUER,
          }
        : undefined,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: "MCP-Router",
      authors: "fjm2u",
      description:
        "Effortlessly manage your MCP servers with the MCP Router. MCP Router provides a user-friendly interface for managing MCP servers, making it easier than ever to work with the MCP.",
      setupIcon: "./public/images/icon/icon.ico",
    }),
    new MakerDMG(
      {
        name: "MCP Router",
        format: "ULFO",
        icon: "./public/images/icon/icon.icns",
      },
      ["darwin"],
    ),
    new MakerZIP(),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.tsx",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
          {
            html: "./src/background.html",
            js: "./src/background.tsx",
            name: "background_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        authToken: process.env.GITHUB_TOKEN,
        repository: {
          owner: repoOwner,
          name: repoName,
        },
        prerelease: false,
        draft: false,
      },
    },
  ],
};

export default config;
