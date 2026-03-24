import { BillingInterval, ApiVersion } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { FileSessionStorage } from "./file-session-storage.js";
import { restResources } from "@shopify/shopify-api/rest/admin/2025-07";
import {
  isPlaceholderAppUrl,
  loadEnvironment,
  resolveAppUrl,
} from "./app-config.js";

loadEnvironment({ searchFromDir: process.cwd() });

const billingConfig = {
  "Premium plan": {
    amount: 149.0,
    currencyCode: "USD",
    trialDays: 0,
    interval: BillingInterval.Every30Days,
  },
};

export const appUrl = resolveAppUrl({ searchFromDir: process.cwd() });

if (
  !process.env.HOST ||
  isPlaceholderAppUrl(process.env.HOST) ||
  process.env.HOST !== appUrl
) {
  process.env.HOST = appUrl;
}

if (
  !process.env.SHOPIFY_APP_URL ||
  isPlaceholderAppUrl(process.env.SHOPIFY_APP_URL) ||
  process.env.SHOPIFY_APP_URL !== appUrl
) {
  process.env.SHOPIFY_APP_URL = appUrl;
}

const scopes = (process.env.SCOPES || "")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const missingEnv = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET"].filter(
  (key) => !process.env[key]
);

if (!scopes.length) {
  missingEnv.push("SCOPES");
}

if (missingEnv.length) {
  throw new Error(
    `Missing required Shopify environment variables: ${missingEnv.join(
      ", "
    )}. Copy .env.example to .env and fill them in, or run the app from the repo root with "npm run dev" so Shopify CLI can inject them.`
  );
}

function createSessionStorage() {
  if (process.env.MONGODB_URL && process.env.MONGODB_DB_NAME) {
    return new MongoDBSessionStorage(
      process.env.MONGODB_URL,
      process.env.MONGODB_DB_NAME
    );
  }

  return new FileSessionStorage();
}

const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.July25,
    restResources,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    hostName: new URL(appUrl).host,
    scopes,
    billing: billingConfig,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: createSessionStorage(),
});

export default shopify;
