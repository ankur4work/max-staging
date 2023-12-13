// @ts-check
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

// Set up Shopify authentication and webhook handling
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

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

const PREMIUM_PLAN = 'MeroxIO Premium';
const MEROXIO = "meroxio";
const PREMIUM_PLAN_KEY = "comparison_premium";
const IS_TEST = false;



app.get("/api/createSubscription", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const hasPayment = await shopify.api.billing.check({
      session,
      plans: [PREMIUM_PLAN],
     
    });

    if (hasPayment) {
      console.log('Already active subscription');
      res.status(200).send({
        isActiveSubscription: true,
      });
    } else {
      const redirectUrl = await shopify.api.billing.request({
        session,
        plan: PREMIUM_PLAN,
        isTest: IS_TEST,
      });
      console.log("Redirect URL: " + redirectUrl);
      res.status(200).send({
        isActiveSubscription: false,
        confirmationUrl: redirectUrl,
      });
    }
  } catch (error) {
    console.error("Failed to create subscription:", error);
    res.status(500).send({
      error: "Failed to create subscription",
    });
  }
});



app.get("/api/cancelSubscription", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const hasPayment = await shopify.api.billing.check({
      session,
      plans: [PREMIUM_PLAN],
      isTest: IS_TEST,
    });

    if (hasPayment) {
      console.log('Active subscription found. Cancelling subscription...');
      const subscriptionStatus = await cancelSubscription(session);
      console.log("Subscription cancelled. Status:", subscriptionStatus);

      // Remove the metafield if it exists
      const client = new shopify.api.clients.Graphql({ session });
      const currentInstallations = await client.query({
        data: {
          query: CURRENT_APP_INSTALLATION,
          variables: {
            namespace: MEROXIO,
            key: PREMIUM_PLAN_KEY
          },
        }
      });

      // @ts-ignore
      const metafield = currentInstallations.body.data.currentAppInstallation.metafield;

      if (metafield) {
        console.log("Removing appOwnedMetafield for shop:", session.shop);
        const mutationResponse = await client.query({
          data: {
            query: DELETE_APP_DATA_METAFIELD,
            variables: {
              input: {
                id: metafield.id
              }
            },
          },
        });

        // @ts-ignore
        if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
          console.error("Failed to delete metafield:", mutationResponse.body.errors);
        } else {
          console.log("Metafield deleted successfully for shop:", session.shop);
        }
      }

      res.status(200).send({
        status: subscriptionStatus,
      });
    } else {
      console.log('No active subscription found.');
      res.status(200).send({
        status: "No subscription found",
      });
    }
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    res.status(500).send({
      error: "Failed to cancel subscription",
    });
  }
});




app.get("/api/hasActiveSubscription", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const hasPayment = await shopify.api.billing.check({
      session,
      plans: [PREMIUM_PLAN],
      isTest: IS_TEST,
    });

    if (hasPayment) {
      console.log('Active subscription found');
      const client = new shopify.api.clients.Graphql({ session });
      const currentInstallations = await client.query({
        data: {
          query: CURRENT_APP_INSTALLATION,
          variables: {
            namespace: MEROXIO,
            key: PREMIUM_PLAN_KEY
          },
        }
      });

      // @ts-ignore
      const ownerId = currentInstallations.body.data.currentAppInstallation.id;
      console.log(currentInstallations.body.data.currentAppInstallation.metafield);

      if(!currentInstallations.body.data.currentAppInstallation.metafield){
      // Create metafield
      const mutationResponse = await client.query({
        data: {
          query: CREATE_APP_DATA_METAFIELD,
          variables: {
            metafieldsSetInput: [
              {
                namespace: MEROXIO,
                key: PREMIUM_PLAN_KEY,
                type: "boolean",
                value: "true",
                ownerId: ownerId
              }
            ],
          },
        },
      });

      // @ts-ignore
      if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
        console.error("Failed to add metafield");
      } else {
        console.log("Metafield for premium plan created/updated successfully for shop: ", session.shop);
      
      }
    }

      res.status(200).send({
        hasActiveSubscription: true,
      });
    } else {
      res.status(200).send({
        hasActiveSubscription: false,
      });
    }
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    res.status(500).send({
      error: "Failed to fetch subscription",
    });
  }
});


app.get("/api/getshop", async (req, res) => {
  const session = res.locals.shopify.session;
  let status = 200;
  let error = null;
  try {
    var response = {'shop': session?.shop}
    res.status(status).send(response);
  } catch (e) {
    console.log(`Failed to get Shop: ${e.message}`);
    status = 500;
    error = e.message;
  }
  
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);

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
