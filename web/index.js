import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import cancelSubscription from "./cancel-subscription.js";
import GDPRWebhookHandlers from "./gdpr.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

/* ---------------------- Shopify Auth & Webhooks ---------------------- */

app.get(shopify.config.auth.path, shopify.auth.begin());

app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

/* ---------------------- Constants ---------------------- */

const PREMIUM_PLAN = "Premium plan";
const MEROXIO = "meroxio";
const PREMIUM_PLAN_KEY = "comparison_premium";
const IS_TEST = false;

/* ---------------------- Utility Functions ---------------------- */

function getSession(res) {
  return res.locals.shopify.session;
}

function getGraphQLClient(session) {
  return new shopify.api.clients.Graphql({ session });
}

async function checkSubscription(session) {
  return await shopify.api.billing.check({
    session,
    plans: [PREMIUM_PLAN],
    isTest: IS_TEST,
  });
}

async function requestSubscription(session) {
  return await shopify.api.billing.request({
    session,
    plan: PREMIUM_PLAN,
    isTest: IS_TEST,
  });
}

/* ---------------------- Metafield Helpers ---------------------- */

async function fetchInstallation(session) {
  const client = getGraphQLClient(session);

  const response = await client.query({
    data: {
      query: CURRENT_APP_INSTALLATION,
      variables: {
        namespace: MEROXIO,
        key: PREMIUM_PLAN_KEY,
      },
    },
  });

  return response.body.data.currentAppInstallation;
}

async function createPremiumMetafield(session, ownerId) {
  const client = getGraphQLClient(session);

  return await client.query({
    data: {
      query: CREATE_APP_DATA_METAFIELD,
      variables: {
        metafieldsSetInput: [
          {
            namespace: MEROXIO,
            key: PREMIUM_PLAN_KEY,
            type: "boolean",
            value: "true",
            ownerId,
          },
        ],
      },
    },
  });
}

async function deletePremiumMetafield(session, metafieldId) {
  const client = getGraphQLClient(session);

  return await client.query({
    data: {
      query: DELETE_APP_DATA_METAFIELD,
      variables: {
        input: {
          id: metafieldId,
        },
      },
    },
  });
}

/* ---------------------- Subscription Routes ---------------------- */

app.get("/api/createSubscription", async (req, res) => {
  try {
    const session = getSession(res);

    const hasPayment = await checkSubscription(session);

    if (hasPayment) {
      console.log("Already active subscription");

      return res.send({
        isActiveSubscription: true,
      });
    }

    const response = await requestSubscription(session);

    /** @type {string|undefined} */
    const confirmationUrl =
      typeof response === "string"
        ? response
        : (response && response.confirmationUrl) || undefined;

    console.log("Redirect URL:", confirmationUrl);

    res.send({
      isActiveSubscription: false,
      confirmationUrl,
    });
  } catch (error) {
    console.error("Failed to create subscription:", error);

    res.status(500).send({
      error: "Failed to create subscription",
    });
  }
});

/* ---------------------- Cancel Subscription ---------------------- */

app.get("/api/cancelSubscription", async (req, res) => {
  try {
    const session = getSession(res);

    const hasPayment = await checkSubscription(session);

    if (!hasPayment) {
      console.log("No active subscription found.");

      return res.send({
        status: "No subscription found",
      });
    }

    console.log("Active subscription found. Cancelling...");

    const subscriptionStatus = await cancelSubscription(session);

    const installation = await fetchInstallation(session);

    const metafield = installation.metafield;

    if (metafield) {
      console.log("Deleting metafield for:", session.shop);

      await deletePremiumMetafield(session, metafield.id);

      console.log("Metafield deleted successfully");
    }

    res.send({
      status: subscriptionStatus,
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);

    res.status(500).send({
      error: "Failed to cancel subscription",
    });
  }
});

/* ---------------------- Check Active Subscription ---------------------- */

app.get("/api/hasActiveSubscription", async (req, res) => {
  try {
    const session = getSession(res);

    const hasPayment = await checkSubscription(session);

    if (!hasPayment) {
      return res.send({
        hasActiveSubscription: false,
      });
    }

    console.log("Active subscription found");

    const installation = await fetchInstallation(session);

    const ownerId = installation.id;

    if (!installation.metafield) {
      await createPremiumMetafield(session, ownerId);

      console.log(
        "Metafield for premium plan created successfully:",
        session.shop
      );
    }

    res.send({
      hasActiveSubscription: true,
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);

    res.status(500).send({
      error: "Failed to fetch subscription",
    });
  }
});




/* ---------------------- Get Shop ---------------------- */

app.get("/api/getshop", async (req, res) => {
  try {
    const session = getSession(res);

    res.send({
      shop: session?.shop,
    });
  } catch (error) {
    console.error("Failed to get shop:", error);

    res.status(500).send({
      error: "Failed to get shop",
    });
  }
});

/* ---------------------- Static & CSP ---------------------- */

app.use(shopify.cspHeaders());

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

/* ---------------------- Start Server ---------------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* ---------------------- GraphQL Queries ---------------------- */

const CURRENT_APP_INSTALLATION = `
query appSubscription($namespace: String!, $key: String!) {
  currentAppInstallation {
    id
    metafield(namespace: $namespace, key: $key) {
      namespace
      key
      value
      id
    }
  }
}
`;

const CREATE_APP_DATA_METAFIELD = `
mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafieldsSetInput) {
    metafields {
      id
      namespace
      key
    }
    userErrors {
      field
      message
    }
  }
}
`;

const DELETE_APP_DATA_METAFIELD = `
mutation metafieldDelete($input: MetafieldDeleteInput!) {
  metafieldDelete(input: $input) {
    deletedId
    userErrors {
      field
      message
    }
  }
}
`;
