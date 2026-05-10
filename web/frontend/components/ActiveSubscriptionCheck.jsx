import { Banner } from "@shopify/polaris";
import { useState } from "react";
import { useAppQuery } from "../hooks";

export function ActiveSubscription() {
  const [dismissed, setDismissed] = useState(false);

  const { data, isLoading } = useAppQuery({
    url: "/api/hasActiveSubscription",
  });

  if (dismissed || isLoading) return null;

  return (
    <div>
      {data?.hasActiveSubscription ? (
        <Banner
          title="Current Plan: Premium Gold"
          status="success"
          onDismiss={() => setDismissed(true)}
        >
          <p>
            You are a <strong>Premium Gold</strong> customer with access to all
            features.
          </p>
          <p>
            <strong>Enable Steps: </strong>
            Open Theme Customization &gt; Select Add Section &gt; Comparison
            Slider
          </p>
        </Banner>
      ) : (
        <Banner
          title="Current Plan: Free"
          status="warning"
          onDismiss={() => setDismissed(true)}
        >
          <p>You are currently on the Free plan with limited features.</p>
          <p>
            <strong>Enable Steps: </strong>
            Open Theme Customization &gt; Select Add Section &gt; Comparison
            Slider – Free
          </p>
        </Banner>
      )}
    </div>
  );
}
