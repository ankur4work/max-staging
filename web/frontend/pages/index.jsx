import React from "react";


import {
  Card,
  Page,
  Layout,
  TextContainer,
  Button,
  Modal,
  Icon,
  DataTable,
  MediaCard,
  Frame,
  TopBar,
  CalloutCard,
  VideoThumbnail
} from "@shopify/polaris";


import { useState, useCallback } from 'react';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { DisplayText } from "@shopify/polaris";
import { ThemeValidate } from "../components/ThemeSelection";
import { ActiveSubscription } from "../components/ActiveSubscriptionCheck";
import { shopifyBackground } from "../assets";
import ReactPlayer from "react-player";
import {
  ExternalMinor,
  CircleTickMinor, HomeMajor
} from '@shopify/polaris-icons';

import { useNavigate } from "react-router-dom";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Toast } from "@shopify/app-bridge-react";
import { Iconkeyfeature } from "../components/Iconkeyfeature";


export default function HomePage() {
  const emptyToastProps = { content: null };
  const [isLoadingSubscribe, setIsLoadingSubscribe] = useState(false);
  const [isLoadingCancelSubscribe, setIsLoadingCancelSubscribe] = useState(false);

  const [active, setActive] = useState(false);
  const [activelookbook, setActiveLookbook] = useState(false);
  const [activefeed, setActiveFeed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = useCallback(() => setActive(!active), [active]);

  const app = useAppBridge();
  const fetch = useAuthenticatedFetch();
  const redirect = Redirect.create(app);

  const [toastProps, setToastProps] = useState(emptyToastProps);
  const activator = <Button onClick={handleChange}>Quick Setup Guide</Button>;


  const {
    data,
  } = useAppQuery({
    url: "/api/getshop",
  });

  const template = 'index'; // Replace with your actual template value
  const uuid = '0f3ce9d4-4972-47a6-b59e-82dff59be994'; // Replace with your actual UUID
  const handle = 'meroxio_comparison_slider'; // Replace with your actual handle
  const reviewUrl = "https://apps.shopify.com/meroxio-comparison-slider#modal-show=WriteReviewModal"


  function openThemeEditor() {
    console.log("Shop: " + data?.shop);
    const url =  `https://${data?.shop}/admin/themes/current/editor?template=${template}`;
    window.open(url);
  }

  function openReviewPage() {
    window.open(reviewUrl);
  }

  async function subscribePlan() {
    setIsLoadingSubscribe(true);
    const res = await fetch("/api/createSubscription"); //fetch instance of userLoggedInFetch(app)
    const data = await res.json();
    setIsLoadingSubscribe(false);
    if (data.error) {
      console.log(data.error);
      setToastProps({ content: "Redirecting to payment page..", error: true });
    } else if (data.confirmationUrl) {
      const { confirmationUrl } = data;
      setToastProps({ content: "Redirecting to payment page.." });
      redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    } else if (data.isActiveSubscription) {
      console.log("Already subscribed")
      setToastProps({ content: "You already have a active subscription" });
    }
  }


  async function cancelSubscription() {
    setIsLoadingCancelSubscribe(true);
    const res = await fetch("/api/cancelSubscription"); //fetch instance of userLoggedInFetch(app)
    const data = await res.json();
    setIsLoadingCancelSubscribe(false);
    console.log(data.status);
    if (data.status === "CANCELLED") {
      setToastProps({ content: "Successfully Cancelled the subscription" });
      window.location.reload();
    } else {
      setToastProps({ content: "Failed to cancel the subscription" });
    }

  }


  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );


  const tickIcon = <Icon
    source={CircleTickMinor}
    color="success"
  />


  const rows = [
    ['Cost', 'Free', '$4.99/month'],
    ['Interactive Visual Comparison', 'Basic', 'Enhanced'],
    ['No Powered By MeroxIO Branding', '-', tickIcon],
    ['Customizable Overlay Settings', 'Limited', tickIcon],
    ['Effortless Integration', 'Standard', 'Priority'],
    ['Responsive Design', tickIcon, tickIcon],
    ['Details Text', '-', tickIcon],
    ['Priority Email/Chat Support', '-', tickIcon]
  ];
  

  // m-lookbook-hearder-part-starting

  const navigate = useNavigate();

  const logo = {

    width: 450,
    height: 90,

    topBarSource:
      `https://cdn.shopify.com/s/files/1/0629/5522/5264/files/MeroxIO_Comparison_Slider.png?v=1702290807`,
    url: '/',
    accessibilityLabel: 'https://cdn.shopify.com/s/files/1/0627/5727/3793/files/lookbook_logo.png?v=1666164778',

  };

  const gotoHomePage = () => {
    navigate("/");
  }


  const secondaryMenuMarkup = (
    <TopBar.Menu
      activatorContent={
        <div className="main-icon">
          <div className="main-icon-1"><Button onClick={gotoHomePage} plain monochrome removeUnderline fullWidth >
            <div className="m-icon-show-1"><Icon source={HomeMajor} /><span className="m-hover-text-1"> <h1>Home</h1></span></div></Button>
          </div>
        </div>
      }

    />
  );





  const topBarMarkup = (
    <TopBar
      secondaryMenu={secondaryMenuMarkup}

    />
  );



  return (
    <Frame topBar={topBarMarkup} logo={logo} >
      <Page>
        {toastMarkup}
        <Layout>
          <Layout.Section>
            <div className="custom-callout-container">
              <CalloutCard
                title="Activate MeroxIO Comaprison Slider"
                illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                primaryAction={{ content: 'Enable Now ➡️', onAction: openThemeEditor, accessibilityLabel: 'Enable Now' }}

              >
                <p>
                Are you prepared to upgrade your store's display? Click 'Enable' to activate the MeroxIO Comparison Slider. Once active, effortlessly adjust settings and tailor the app to complement your store's aesthetic. Enhance your customers' viewing experience now!
                </p>
              </CalloutCard>
            </div>
          </Layout.Section>
          <Layout.Section>

            <TextContainer>
              <DisplayText size="Large"><span>Introduction</span></DisplayText>

              <p>Welcome to a new era of dynamic and captivating product presentation with Comparison Slider – the innovative solution designed to transform your Shopify store. Developed by MeroxIO, our app redefines the way you showcase products, offering an engaging blend of visual comparison and informative text elements.</p>

              <h2><b>Key Features:</b></h2>
              <ul className="appFeatures">
                <li><strong>Interactive Comparison:</strong> Engage customers seamlessly with an interactive slider for dynamic image comparisons, enhancing your product showcase.</li>
                <li><strong>Brand-Focused Customization:</strong> Tailor the slider's appearance to match your brand effortlessly, ensuring a consistent and branded look that resonates with your identity.</li>
                <li><strong>Effortless Setup:</strong> Easily integrate into your Shopify store for a hassle-free user experience, no complex coding required.</li>
                <li><strong>Responsive Design:</strong> Provide a consistent and visually appealing experience across devices - desktops, tablets, and smartphones.</li>
                <li><strong>Comprehensive Information:</strong> Combine visual impact with essential product details through integrated text features, offering a thorough and informative product exploration.</li>
              </ul>


            </TextContainer>

            <div style={{ display: "flex" }}>

              <Modal
                activator={activator}
                open={active}
                onClose={handleChange}
                title="Quick Setup in 2.0 themes"
              >
                <Modal.Section>
                  <div>

                    <div style={{ padding: '56% 0 0 0', position: 'relative' }}><iframe src="https://cdn.shopify.com/videos/c/o/v/cf61027e625d4f5b90c5fea31bc2de2e.mp4" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }} title="Quick Setup"></iframe></div>
                  </div>
                </Modal.Section>
              </Modal>


              <Button plain onClick={openThemeEditor} style={{ marginLeft: "auto" }}>
                <div className="appEnableBtn"><span>Enable Now</span>
                  <Icon
                    source={ExternalMinor}
                    color="base"
                  /></div>
              </Button>
            </div>
          </Layout.Section>




          <Layout.Section secondary>
            <Card>
              <div className="videoWrapper" style={{ backgroundImage: `url(${shopifyBackground})`, padding: '22px' }}>
                <ReactPlayer
                  url={"https://cdn.shopify.com/videos/c/o/v/ebf447344ab14bcc95b526034be22691.mp4"}
                  playing={true}
                  controls={true}
                  loop={true}
                  muted={true}
                  playsinline={true}

                />

              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>



            <div className="planComparison">
              <Card title="Plan Comparison" sectioned

                primaryFooterAction={{
                  content: 'Subscribe to MeroxIO Gold',
                  onAction: () => {
                    subscribePlan()
                  },
                  loading: isLoadingSubscribe
                }}
                secondaryFooterActions={[{
                  content: 'Cancel Subscription',
                  onAction: () => {
                    cancelSubscription()
                  },
                  destructive: true,
                  loading: isLoadingCancelSubscribe
                }
                ]}
              >
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'Features',
                    'Free version',
                    'MeroxIO Gold',
                  ]}
                  rows={rows}
                  increasedTableDensity
                  hasZebraStripingOnData
                  hoverable
                />
              </Card>
            </div>
          </Layout.Section>

          <Layout.Section>
          <ActiveSubscription />
        </Layout.Section>

          <Layout.Section>

            <CalloutCard
              title="How is your experience with our app ?"
              illustration="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/customer-review.gif?v=1668584409"
              primaryAction={{
                content: 'Leave a 5-Star Review',
                onAction: openReviewPage
              }}
            >
              <p>🌟 "We're always striving to make our App better for you, and your feedback lights the way! 🚀 Your thoughts and experiences are invaluable to us. If you've enjoyed using our app, we'd be thrilled if you could share your positive experiences with a ⭐⭐⭐⭐⭐ review on the Shopify App Store. Your support not only motivates our team but also helps other merchants discover the benefits of our App! Thank you for being an amazing part of our journey!" 🙌</p>
            </CalloutCard>


          </Layout.Section>

        </Layout>





      </Page>

    </Frame>
  );
}


