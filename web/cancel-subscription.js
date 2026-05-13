import shopify from "./shopify.js";

export default async function cancelSubscription(session) {
  const subscriptionId = await getActiveSubsId(session);
  console.log("subscriptionId:", subscriptionId);

  return appSubscriptionCancel(session, subscriptionId);
}

async function getActiveSubsId(session) {
  const client = new shopify.api.clients.Graphql({ session });
  const result = await client.request(RECURRING_PURCHASES_QUERY);

  const subscriptions =
    result?.data?.currentAppInstallation?.activeSubscriptions || [];

  if (!subscriptions.length) {
    throw new Error("No active subscription found to cancel.");
  }

  const activeSubscription = subscriptions[0];
  console.log("subscription name:", activeSubscription.name);
  console.log("Subscription Id:", activeSubscription.id);

  return activeSubscription.id;
}

async function appSubscriptionCancel(session, subscriptionId) {
  const client = new shopify.api.clients.Graphql({ session });
  const result = await client.request(CANCEL_SUBSCRIPTION, {
    variables: { id: subscriptionId },
  });

  const responseErrors = result?.errors || [];
  const userErrors =
    result?.data?.appSubscriptionCancel?.userErrors || [];

  if (responseErrors.length || userErrors.length) {
    throw new Error(
      JSON.stringify({ responseErrors, userErrors }, null, 2)
    );
  }

  console.log("Subscription canceled successfully:", session.shop);
  return result.data.appSubscriptionCancel.appSubscription.status;
}

const CANCEL_SUBSCRIPTION = `
mutation appSubscriptionCancel($id: ID!) {
  appSubscriptionCancel(id: $id) {
    appSubscription {
      id
      name
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

const RECURRING_PURCHASES_QUERY = `
query appSubscription {
  currentAppInstallation {
    activeSubscriptions {
      name, id, test
    }
  }
}
`;
