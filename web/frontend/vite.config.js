import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import react from "@vitejs/plugin-react";
import { loadEnvironment, resolveAppUrl } from "../app-config.js";

const frontendDir = dirname(fileURLToPath(import.meta.url));
loadEnvironment({ searchFromDir: frontendDir });

const backendPort = process.env.BACKEND_PORT || "3000";
const frontendPort = process.env.FRONTEND_PORT || "3001";
const appHost = resolveAppUrl({ searchFromDir: frontendDir });

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

const proxyOptions = {
  target: `http://127.0.0.1:${backendPort}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = appHost.replace(/https?:\/\//, "");

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: frontendPort,
    clientPort: 443,
  };
}

export default defineConfig({
  root: frontendDir,
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: "localhost",
    port: frontendPort,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
