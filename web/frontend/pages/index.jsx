import { useState } from "react";
import {
  Card,
  Page,
  Button,
  Icon,
  DataTable,
  Frame,
  TopBar,
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { ActiveSubscription } from "../components/ActiveSubscriptionCheck";
import { shopifyBackground } from "../assets";
import ReactPlayer from "react-player";
import {
  ExternalMinor,
  CircleTickMinor,
  HomeMajor,
} from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const { data } = useAppQuery({ url: "/api/getshop" });
  const { data: subData } = useAppQuery({
    url: "/api/hasActiveSubscription",
  });

  const hasSubscription = subData?.hasActiveSubscription === true;

  const template = "index";
  const reviewUrl =
    "https://apps.shopify.com/meroxio-comparison-slider#modal-show=WriteReviewModal";

  function openThemeEditor() {
    const url = `https://${data?.shop}/admin/themes/current/editor?template=${template}`;
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

  const tickIcon = <Icon source={CircleTickMinor} color="success" />;
  const dashIcon = <span className="plan-dash">&mdash;</span>;

  const rows = [
    ["Cost", "Free", "$149.00/month"],
    ["Interactive Visual Comparison", "Basic", "Enhanced"],
    ["Customizable Overlay Settings", "Limited", tickIcon],
    ["Effortless Integration", "Standard", "Priority"],
    ["Responsive Design", tickIcon, tickIcon],
    ["Details Text", dashIcon, tickIcon],
    ["Priority Email/Chat Support", dashIcon, tickIcon],
  ];

  const logo = {
    width: 50,
    height: 25,
    topBarSource:
      "https://cdn.shopify.com/s/files/1/0568/7754/7671/files/Untitled_design_24.png?v=1766553044",
    url: "/",
    accessibilityLabel: "MeroxIO Comparison Slider",
  };

  const secondaryMenuMarkup = (
    <TopBar.Menu
      activatorContent={
        <div className="main-icon">
          <div className="main-icon-1">
            <Button
              onClick={() => navigate("/")}
              plain
              monochrome
              removeUnderline
              fullWidth
            >
              <div className="m-icon-show-1">
                <Icon source={HomeMajor} />
                <span className="m-hover-text-1">
                  <h1>Home</h1>
                </span>
              </div>
            </Button>
          </div>
        </div>
      }
    />
  );

  const topBarMarkup = <TopBar secondaryMenu={secondaryMenuMarkup} />;

  return (
    <Frame topBar={topBarMarkup} logo={logo}>
      <Page>
        {toastMarkup}

        <div className="m-dashboard">
          {/* Subscription Banner */}
          <ActiveSubscription />

          {/* Hero Section */}
          <div className="m-hero">
            <div className="m-hero-content">
              <h1 className="m-hero-title">Comparison Slider</h1>
              <p className="m-hero-subtitle">
                Transform your product presentation with interactive
                before-and-after comparisons that drive engagement and
                conversions.
              </p>
              <div className="m-hero-actions">
                <Button primary onClick={openThemeEditor}>
                  Open Theme Editor
                </Button>
                <Button onClick={() => window.open(reviewUrl)}>
                  Leave a Review
                </Button>
              </div>
            </div>
            <div className="m-hero-video">
              <div
                className="m-video-container"
                style={{
                  backgroundImage: `url(${shopifyBackground})`,
                }}
              >
                <ReactPlayer
                  url="https://cdn.shopify.com/videos/c/o/v/ebf447344ab14bcc95b526034be22691.mp4"
                  playing={true}
                  controls={true}
                  loop={true}
                  muted={true}
                  playsinline={true}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="m-section">
            <h2 className="m-section-title">Why Comparison Slider?</h2>
            <div className="m-features">
              <div className="m-feature-card">
                <div className="m-feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c6ac4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                </div>
                <h3>Interactive Comparison</h3>
                <p>Drag-to-compare slider for dynamic image comparisons that engage customers instantly.</p>
              </div>
              <div className="m-feature-card">
                <div className="m-feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c6ac4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                </div>
                <h3>Brand Customization</h3>
                <p>Match colors, fonts, and styling to your brand for a seamless, consistent look.</p>
              </div>
              <div className="m-feature-card">
                <div className="m-feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c6ac4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h3>Zero-Code Setup</h3>
                <p>Add to any theme in clicks — no developer or coding skills required.</p>
              </div>
              <div className="m-feature-card">
                <div className="m-feature-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c6ac4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <h3>Fully Responsive</h3>
                <p>Looks great on desktops, tablets, and phones with automatic resizing.</p>
              </div>
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="m-section">
            <h2 className="m-section-title">Choose Your Plan</h2>
            <div className="m-plans-wrapper">
              <Card sectioned>
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Features", "Free", "Premium"]}
                  rows={rows}
                  increasedTableDensity
                  hasZebraStripingOnData
                  hoverable
                />
                <div className="m-plan-actions">
                  {hasSubscription ? (
                    <Button destructive onClick={cancelSubscription}>
                      Cancel Subscription
                    </Button>
                  ) : (
                    <Button primary onClick={subscribePlan} loading={isLoadingSubscribe}>
                      Upgrade to Premium
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Footer Review CTA */}
          <div className="m-review-bar">
            <span>Enjoying the app? Your feedback helps us improve.</span>
            <Button plain onClick={() => window.open(reviewUrl)}>
              <span className="m-review-link">
                Leave a Review <Icon source={ExternalMinor} color="base" />
              </span>
            </Button>
          </div>
        </div>
      </Page>
    </Frame>
  );
}
