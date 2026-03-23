import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import dotenv from "dotenv";

const ENV_FILES = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "..", ".env"),
];

for (const envFile of ENV_FILES) {
  if (existsSync(envFile)) {
    const parsed = dotenv.parse(readFileSync(envFile));

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  }
}

const billingConfig = {
  "Premium plan": {
    amount: 149.0,
    currencyCode: "USD",
    trialDays: 0,
    interval: BillingInterval.Every30Days,
  },
};

const appUrl =
  process.env.HOST || process.env.SHOPIFY_APP_URL || "http://localhost:3000";

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
  const mongoUrl = process.env.MONGODB_URL;
  const mongoDbName = process.env.MONGODB_DB_NAME;

  if (mongoUrl && mongoDbName) {
    return new MongoDBSessionStorage(new URL(mongoUrl), mongoDbName);
  }

  console.warn(
    "MONGODB_URL/MONGODB_DB_NAME not set. Using in-memory session storage for local development."
  );

  return new MemorySessionStorage();
}

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    hostName: appUrl.replace(/https?:\/\//, ""),
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
