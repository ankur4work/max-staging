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

function getEnvNumber(name, fallback) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return fallback;
  }

  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

const premiumPlanAmount = getEnvNumber("SHOPIFY_BILLING_PREMIUM_AMOUNT", 30);
const premiumPlanTrialDays = getEnvNumber("SHOPIFY_BILLING_PREMIUM_TRIAL_DAYS", 3);

const billingConfig = {
  "Premium plan": {
    amount: premiumPlanAmount,
    currencyCode: "USD",
    trialDays: premiumPlanTrialDays,
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
