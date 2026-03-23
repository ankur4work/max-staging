import { useState } from "react";
import { Page } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Toast } from "@shopify/app-bridge-react";

export default function HomePage() {
  const emptyToastProps = { content: null };
  const [isLoadingSubscribe, setIsLoadingSubscribe] = useState(false);
  const [toastProps, setToastProps] = useState(emptyToastProps);

  const app = useAppBridge();
  const fetch = useAuthenticatedFetch();
  const redirect = Redirect.create(app);

  const { data } = useAppQuery({ url: "/api/getshop" });
  const { data: subData } = useAppQuery({
    url: "/api/hasActiveSubscription",
  });

  const hasSubscription = subData?.hasActiveSubscription === true;

  const reviewUrl =
    "https://apps.shopify.com/meroxio-comparison-slider#modal-show=WriteReviewModal";

  function openThemeEditor() {
    const url = `https://${data?.shop}/admin/themes/current/editor?template=index`;
    window.open(url);
  }

  async function subscribePlan() {
    setIsLoadingSubscribe(true);
    const res = await fetch("/api/createSubscription");
    const data = await res.json();
    setIsLoadingSubscribe(false);
    if (data.error) {
      setToastProps({ content: "Failed to create subscription", error: true });
    } else if (data.confirmationUrl) {
      setToastProps({ content: "Redirecting to payment page.." });
      redirect.dispatch(Redirect.Action.REMOTE, data.confirmationUrl);
    } else if (data.isActiveSubscription) {
      setToastProps({ content: "You already have an active subscription" });
    }
  }

  async function cancelSubscription() {
    const res = await fetch("/api/cancelSubscription");
    const data = await res.json();
    if (data.status === "CANCELLED") {
      setToastProps({ content: "Successfully cancelled the subscription" });
      window.location.reload();
    } else {
      setToastProps({ content: "Failed to cancel the subscription" });
    }
  }

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  return (
    <Page title="Comparison Slider">
      {toastMarkup}

      <div style={{ padding: "20px" }}>
        {/* Subscription Status */}
        <div style={{
          padding: "16px",
          marginBottom: "24px",
          borderRadius: "8px",
          background: hasSubscription ? "#e3f1df" : "#fff3cd",
          border: hasSubscription ? "1px solid #008060" : "1px solid #b98900",
        }}>
          <strong>{hasSubscription ? "Plan: Premium Gold" : "Plan: Free"}</strong>
          <p style={{ margin: "4px 0 0" }}>
            {hasSubscription
              ? "You have access to all features."
              : "You are on the Free plan with limited features."}
          </p>
        </div>

        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg, #5c6ac4, #6f7ff7)",
          borderRadius: "12px",
          padding: "36px",
          color: "#fff",
          marginBottom: "24px",
        }}>
          <h1 style={{ margin: "0 0 12px", fontSize: "28px" }}>Comparison Slider</h1>
          <p style={{ margin: "0 0 20px", opacity: 0.9 }}>
            Transform your product presentation with interactive before-and-after
            comparisons that drive engagement and conversions.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={openThemeEditor}
              style={{
                padding: "10px 20px",
                background: "#fff",
                color: "#5c6ac4",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Open Theme Editor
            </button>
            <button
              onClick={() => window.open(reviewUrl)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Leave a Review
            </button>
          </div>
        </div>

        {/* Features */}
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Why Comparison Slider?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {[
            { title: "Interactive Comparison", desc: "Drag-to-compare slider for dynamic image comparisons." },
            { title: "Brand Customization", desc: "Match colors and styling to your brand." },
            { title: "Zero-Code Setup", desc: "Add to any theme in clicks — no coding required." },
            { title: "Fully Responsive", desc: "Looks great on all devices with automatic resizing." },
          ].map((f) => (
            <div key={f.title} style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}>
              <strong style={{ display: "block", marginBottom: "8px" }}>{f.title}</strong>
              <p style={{ margin: 0, fontSize: "13px", color: "#637381" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Plan Table */}
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Choose Your Plan</h2>
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
          marginBottom: "24px",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                <th style={{ textAlign: "left", padding: "10px", fontSize: "13px", textTransform: "uppercase", color: "#637381" }}>Features</th>
                <th style={{ textAlign: "center", padding: "10px", fontSize: "13px", textTransform: "uppercase", color: "#637381" }}>Free</th>
                <th style={{ textAlign: "center", padding: "10px", fontSize: "13px", textTransform: "uppercase", color: "#5c6ac4" }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Cost", "Free", "$149.00/month"],
                ["Interactive Visual Comparison", "Basic", "Enhanced"],
                ["Customizable Overlay Settings", "Limited", "\u2713"],
                ["Effortless Integration", "Standard", "Priority"],
                ["Responsive Design", "\u2713", "\u2713"],
                ["Details Text", "\u2014", "\u2713"],
                ["Priority Support", "\u2014", "\u2713"],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 ? "#fafafa" : "#fff" }}>
                  <td style={{ padding: "10px", fontWeight: 500 }}>{row[0]}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{row[1]}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
            {hasSubscription ? (
              <button
                onClick={cancelSubscription}
                style={{ padding: "10px 20px", background: "#d72c0d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel Subscription
              </button>
            ) : (
              <button
                onClick={subscribePlan}
                disabled={isLoadingSubscribe}
                style={{ padding: "10px 20px", background: "#5c6ac4", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                {isLoadingSubscribe ? "Loading..." : "Upgrade to Premium"}
              </button>
            )}
          </div>
        </div>

        {/* Review */}
        <div style={{
          textAlign: "center",
          padding: "16px",
          border: "1px dashed #c4cdd5",
          borderRadius: "12px",
          color: "#637381",
        }}>
          Enjoying the app? <a href={reviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#5c6ac4" }}>Leave a Review</a>
        </div>
      </div>
    </Page>
  );
}
