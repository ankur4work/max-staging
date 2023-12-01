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
  const uuid = '51b1bbbc-cc5e-42e6-9b97-899741c85f10'; // Replace with your actual UUID
  const handle = 'meroxio-spin-and-shop'; // Replace with your actual handle
  const reviewUrl = "https://apps.shopify.com/meroxio-product-video-feed"


  function openThemeEditor() {
    console.log("Shop: " + data?.shop);
    const url = `https://${data?.shop}/admin/themes/current/editor?context=apps&template=${template}&activateAppId=${uuid}/${handle}`;
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
    ['Cost', 'Free', '$9.99/month'],
    ['Daily Spin Limit per Customer', '5 spins', 'Unlimited spins'],
    ['No Powered By MeroxIO Branding', '-', tickIcon],
    ['Interactive Spin-to-Win Mechanism', tickIcon, tickIcon],
    ['Exciting Product Discovery', tickIcon, tickIcon],
    ['Exclusive Discount Offers', tickIcon, tickIcon],
    ['Customizable Spin Experience', '-', tickIcon],
    ['Responsive Design', tickIcon, tickIcon],
    ['Priority Email/Chat Support', '-', tickIcon]
  ];
  

  // m-lookbook-hearder-part-starting

  const navigate = useNavigate();

  const logo = {

    width: 450,
    height: 90,

    topBarSource:
      `https://cdn.shopify.com/s/files/1/0749/4638/0075/files/MeroxIOBYOB.png`,
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
                title="Activate Jackpot Spin and Shop"
                illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                primaryAction={{ content: 'Enable Now ➡️', onAction: openThemeEditor, accessibilityLabel: 'Enable Now' }}

              >
                <p>
                  Ready to enhance your store's experience? Click 'Enable' to activate the Jackpot Spin and Shop feature. Once enabled, you can easily customize settings and personalize the app to match your store's style. Elevate your customer's shopping journey today!
                </p>
              </CalloutCard>
            </div>
          </Layout.Section>
          <Layout.Section>

            <TextContainer>
              <DisplayText size="Large"><span>Introduction</span></DisplayText>

              <p>Welcome to MeroxIO Jackpot Spin and Shop! Our innovative app revolutionizes the shopping experience on your Shopify store. MeroxIO Jackpot Spin and Shop offers a unique and interactive way for customers to discover and purchase products. Inspired by the excitement of slot machines, this app allows customers to spin a virtual wheel and land on a set of three random products from your store's offerings.</p>

              <h2><b>Key Features:</b></h2>
              <ul className="appFeatures">
                <li><strong>Interactive Spin-to-Win Mechanism:</strong> Customers can click the 'spin' button to start the slot machine, randomly selecting three products from your inventory.</li>
                <li><strong>Exciting Product Discovery:</strong> Each spin showcases different products, offering a new and thrilling way to explore your catalog.</li>
                <li><strong>Exclusive Discount Offers:</strong> Products selected by the spin come with special discounted rates, set by the shop admin, encouraging immediate purchases.</li>
                <li><strong>Customizable Spin Experience:</strong> Tailor the look and feel of the spin mechanism to match your store's branding and aesthetics.</li>
                <li><strong>Responsive Design:</strong> Optimized for a seamless experience across desktop, tablet, and mobile devices.</li>
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

                    <div style={{ padding: '56% 0 0 0', position: 'relative' }}><iframe src="https://cdn.shopify.com/videos/c/o/v/f51fa15242a64c3aba2fc26f724fe462.mp4?portrait=0&loop=1&title=0&byline=0&sidedock=0&h=881b23983c&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }} title="Quick Setup"></iframe></div>
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
                {/* <ReactPlayer
                  url={"https://cdn.shopify.com/videos/c/o/v/e4c7dbfe52234119b9339b1778d94889.mp4"}
                  playing={true}
                  controls={true}
                  loop={true}
                  muted={true}
                  playsinline={true}

                /> */}

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


