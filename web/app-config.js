import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";

const PLACEHOLDER_HOSTS = new Set([
  "your-app-domain.com",
  "your-dev-tunnel.trycloudflare.com",
  "example.com",
]);

function unique(items) {
  return [...new Set(items)];
}

function normalizeUrl(value) {
  if (!value) return undefined;

  try {
    const normalized = new URL(value.trim());
    normalized.hash = "";
    normalized.search = "";
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function isPlaceholderAppUrl(value) {
  const normalized = normalizeUrl(value);

  if (!normalized) {
    return true;
  }

  const { hostname } = new URL(normalized);
  return PLACEHOLDER_HOSTS.has(hostname);
}

export function loadEnvironment({ searchFromDir = process.cwd() } = {}) {
  const directories = unique([
    resolve(searchFromDir),
    resolve(searchFromDir, ".."),
    resolve(searchFromDir, "..", ".."),
  ]);

  for (const directory of directories) {
    const envFile = resolve(directory, ".env");

    if (!existsSync(envFile)) {
      continue;
    }

    const parsed = dotenv.parse(readFileSync(envFile));

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  }
}

function readShopifyAppConfig(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    const applicationUrl = content.match(
      /^application_url\s*=\s*"([^"]+)"/m
    )?.[1];
    const clientId = content.match(/^client_id\s*=\s*"([^"]+)"/m)?.[1];

    return {
      applicationUrl: normalizeUrl(applicationUrl),
      clientId,
      filePath,
    };
  } catch {
    return undefined;
  }
}

function findShopifyAppConfigs(searchFromDir) {
  const directories = unique([
    resolve(searchFromDir),
    resolve(searchFromDir, ".."),
    resolve(searchFromDir, "..", ".."),
  ]);

  const configs = [];

  for (const directory of directories) {
    let entries = [];

    try {
      entries = readdirSync(directory);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!/^shopify\.app(?:\.[^.]+)?\.toml$/i.test(entry)) {
        continue;
      }

      const config = readShopifyAppConfig(resolve(directory, entry));

      if (config?.applicationUrl) {
        configs.push(config);
      }
    }
  }

  return configs;
}

export function resolveAppUrl({ searchFromDir = process.cwd() } = {}) {
  loadEnvironment({ searchFromDir });

  const envCandidates = [
    process.env.SHOPIFY_APP_URL,
    process.env.HOST,
  ].map(normalizeUrl);

  for (const candidate of envCandidates) {
    if (candidate && !isPlaceholderAppUrl(candidate)) {
      return candidate;
    }
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const configCandidates = findShopifyAppConfigs(searchFromDir)
    .map((config) => ({
      ...config,
      score:
        (config.clientId && apiKey && config.clientId === apiKey ? 4 : 0) +
        (!isPlaceholderAppUrl(config.applicationUrl) ? 2 : 0) +
        (!config.applicationUrl.includes("trycloudflare.com") ? 1 : 0),
    }))
    .sort((left, right) => right.score - left.score);

  if (configCandidates.length) {
    return configCandidates[0].applicationUrl;
  }

  return "http://localhost:3000";
}
