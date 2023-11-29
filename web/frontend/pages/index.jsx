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
  CircleTickMinor, HomeMajor, ChecklistMajor, QuestionMarkMajor, CashDollarMajor
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
  const handleChangelookbook = useCallback(() => setActiveLookbook(!activelookbook), [activelookbook]);
  const handleChangevideofeed = useCallback(() => setActiveFeed(!activefeed), [activefeed]);
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


  function openThemeEditor() {
    console.log("Shop: " + data?.shop);
    window.open("https://" + data?.shop + "/admin/themes/current/editor");
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
    ['Cost', 'Free', '$9.99/month',],
    ['Product Collection Selection ', tickIcon, tickIcon,],
    ['Bundle product limit per product', '2', '5',],
    ['Embed button in product image', '-', tickIcon,],
    ['Product CTA(Add to cart)', tickIcon, tickIcon,],
    ['No Powered By MeroxIO', '-', tickIcon,],
    ['Custom Style Settings', '-', tickIcon,],
    ['Email/Chat Support', '-', tickIcon,],
    ['Free installation support', '-', tickIcon,],
    ['Theme Selection', '-', tickIcon,]
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

  const gotoInstallPage = () => {
    navigate("/install");

  }

  const gotoSupportPage = () => {
    navigate("/support");
  }

  const gotoPricingPage = () => {
    navigate("/pricing");
  }



  const secondaryMenuMarkup = (
    <TopBar.Menu
      activatorContent={
        <div className="main-icon">
          <div className="main-icon-1"><Button onClick={gotoHomePage} plain monochrome removeUnderline fullWidth >
          <div className="m-icon-show-1"><Icon source={HomeMajor} /><span className="m-hover-text-1"> <h1>Home</h1></span></div></Button>
        </div>

        <div className="main-icon-2"><Button onClick={gotoInstallPage} plain monochrome removeUnderline fullWidth >
          <div className="m-icon-show-2"><Icon source={ChecklistMajor} /><span className="m-hover-text-2"> <h1>Merox Installation</h1></span></div></Button>
        </div>

        <div className="main-icon-3"><Button onClick={gotoPricingPage} plain monochrome removeUnderline fullWidth >
          <div className="m-icon-show-3"><Icon source={CashDollarMajor} /><span className="m-hover-text-3"> <h1>Pricing</h1></span></div></Button>
        </div>

        <div className="main-icon-4"><Button onClick={gotoSupportPage} plain monochrome removeUnderline fullWidth >
          <div className="m-icon-show-4"><Icon source={QuestionMarkMajor} /><span className="m-hover-text-4"> <h1>Support</h1></span></div></Button>
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
            <ActiveSubscription />
          </Layout.Section>

          {/* <Layout.Section>
            <ThemeValidate />
          </Layout.Section> */}


          <Layout.Section>

            <TextContainer>
              <DisplayText size="Large"><span>Introduction</span></DisplayText>

              {/* <p>Welcome to our guide on building a custom box Shopify application block!</p>
              <p>In this tutorial, we will walk you through creating a powerful box customization feature for your Shopify store. Enable customers to personalize their purchases and enhance their shopping experience.</p>
              <p>Integrate the custom box application block to empower customers to select and customize items for their box. Mix and match products, choose quantities, and personalize the box itself.</p>
              <p>Offering a custom box option can boost customer satisfaction, engagement, and sales. Follow this guide to seamlessly build and integrate this feature into your Shopify store for an interactive shopping experience.</p>
              <p>Learn the necessary steps, from setting up the development environment to implementing the application block's functionality. Get code snippets, best practices, and tips to create your custom box Shopify application block.</p>
              <p>Let's embark on this exciting journey of building your own custom box application block and elevate your Shopify store!</p> */}
              <p>MeroxIo BYOB (Build Your Own Bundle) allows you to create custom bundle pages to boost AOV. Bundles are treated as products with a customizable template that can be styled in the theme editor. Customers can mix and match products on a single page.</p>

              <h2><b>Key Features:</b></h2>
              <ul className="appFeatures">
                <li><strong>Product Selection:</strong>  Customers can browse and choose products from your store's inventory for their custom box.</li>
                <li><strong>Quantity Customization:</strong>  Customers can specify the quantity of each product they want in their custom box.</li>
                <li><strong>Pricing and Total Calculation:</strong>  The application calculates the real-time total cost of the custom box, including item prices, quantities, and any additional charges.</li>
                <li><strong>Visual Representation:</strong>  Customers can see a preview of how their chosen products will be arranged in the box.</li>
                <li><strong>Mobile-Friendly Design:</strong>  The application is optimized for mobile devices, allowing customers to customize their boxes conveniently on smartphones or tablets.</li>
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

            {/* m-iconkeyfeature-calling-function-define */}

            <div className="m-keyfeature-container-1">
              <Iconkeyfeature imagespeed="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/install.png?v=1665828891" productname="Easy to install" description="No manual installation and coding is required. Single click install app." />
              <Iconkeyfeature imagespeed="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/speedperformance.png?v=1665832938" productname="High speed performance" description="Optimized for maximum performance. It is highly optimized, lightweight, fast and easy to use." />
              <Iconkeyfeature imagespeed="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/responsive.png?v=1665833458" productname="Fully responsive" description=" Our lookbook application is fully responsive on mobile and tablet and especially supportive in both IOS and Android." />
              <Iconkeyfeature imagespeed="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/visitors.png?v=1665833458" productname="Boost customer's visit" description="Engage with customers on your online store and inspire them to purchase." />
              <Iconkeyfeature imagespeed="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/customize.png?v=1665833377" productname="Easy to customize" description="You'll create something that not only looks great, but that also inspires potential customers." />
              <Iconkeyfeature imagespeed="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/boost-1_9338cf62-00ac-42c6-833a-c175ef71e064.png?v=1665834143" productname=" Boost your sales" description=" By featuring certain products that can generate interest and sales for those items. Our application is 2.0 compatible. " />
            </div>

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

          {/* m-Previous-meroxIO-application-section */}

          <div className="m-mediacard-container">

            <div className="m-mediacard-container-1">
              <MediaCard
                portrait
                title="Lookbook"
                primaryAction={{
                  content: 'View on Shopify app store',
                  url: 'https://apps.shopify.com/meroxio-lookbook',

                }}
                description="Lookbooks are a great way to show shoppers what your store is all about.A lookbook is a collection of images that represent a certain style or concept. They are often used in fashion and design to give an overview of a season's trends or to showcase a specific style."
                secondaryAction={{
                  content: 'Demo app store',
                  url: 'https://apps.meroxio.com/pages/lookbook',

                }}
              >
                <VideoThumbnail
                  videoLength={0}
                  thumbnailUrl="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/Lookbook.png?v=1668583221"
                  onClick={handleChangelookbook}
                />

              </MediaCard>

            </div>

            {/* m-lookbook-video-modal */}

            <Modal
              open={activelookbook}
              onClose={handleChangelookbook}
              title="Quick Setup in 2.0 themes"
            >
              <Modal.Section>
                <div style={{ padding: '56% 0 0 0', position: 'relative' }}><iframe src="https://cdn.shopify.com/videos/c/o/v/02577a268ca04d03a9e085966d63c02a.mp4?portrait=0&loop=1&title=0&byline=0&sidedock=0&h=881b23983c&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }} title="Quick Setup"></iframe></div>
              </Modal.Section>
            </Modal>



            <div className="m-mediacard-container-2">
              <MediaCard
                portrait
                title="Product Video Feed"
                primaryAction={{
                  content: 'View on Shopify app store',

                  url: 'https://apps.shopify.com/meroxio-product-video-feed',

                }}
                description="With our Product Video Feed, you can create powerful, custom slides with shoppable videos for your product upsell using your Instagram reels, TikTok videos Add unique videos on thousands of pages with just one click using our Product Video Feed."
                secondaryAction={{
                  content: 'Demo app store',
                  url: 'https://apps.meroxio.com/',

                }}
              >
                <VideoThumbnail
                  videoLength={0}
                  thumbnailUrl="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/meroxIO_image.png?v=1666008103"
                  onClick={handleChangevideofeed}
                />

              </MediaCard>

            </div>

            {/* m-videofeed-video-modal */}


            <Modal
              open={activefeed}
              onClose={handleChangevideofeed}
              title="Quick Setup in 2.0 themes"
            >
              <Modal.Section>
                <div style={{ padding: '56% 0 0 0', position: 'relative' }}><iframe src="https://cdn.shopify.com/videos/c/o/v/d6ddb66559334f44ab27f9ad5c8bbe13.mp4?portrait=0&loop=1&title=0&byline=0&sidedock=0&h=881b23983c&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }} title="Quick Setup"></iframe></div>
              </Modal.Section>
            </Modal>
          </div>






          {/* reviews-part */}
          <div className='container merox-reviews-part'>

            <CalloutCard
              title="How is your experience with our app ?"
              illustration="https://cdn.shopify.com/s/files/1/0627/5727/3793/files/customer-review.gif?v=1668584409"
              primaryAction={{
                content: 'Review',
                url: 'https://apps.shopify.com/meroxio-view-similar-products',
              }}
            >
            <p className='paragraph'>"Your honest feedback helps encourage us and make improvements to our app! Please leave a review on the Shopify App Store.”</p>
            </CalloutCard>
          </div>



        </Layout>





      </Page>

    </Frame>
  );
}


