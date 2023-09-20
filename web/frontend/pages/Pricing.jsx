import {
    Page,
    Card,
    Layout,
    Icon,
    DataTable,
    TopBar,
    Button,
    Frame,
} from "@shopify/polaris";

import { CircleTickMinor, HomeMajor, ChecklistMajor, QuestionMarkMajor, CashDollarMajor } from '@shopify/polaris-icons';

import { ActiveSubscription } from "../components/ActiveSubscriptionCheck";
import { shopifyBackground } from "../assets";

import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Redirect } from "@shopify/app-bridge/actions";
import { ThemeValidate } from "../components/ThemeSelection";

import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Toast } from "@shopify/app-bridge-react";

export default function Pricing() {
    const emptyToastProps = { content: null };
    const [isLoadingSubscribe, setIsLoadingSubscribe] = useState(false);
    const [isLoadingCancelSubscribe, setIsLoadingCancelSubscribe] = useState(false);
    const app = useAppBridge();
    const fetch = useAuthenticatedFetch();
    const redirect = Redirect.create(app);
    const [toastProps, setToastProps] = useState(emptyToastProps);


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
        const res = await fetch("/api/recurringSubscription"); //fetch instance of userLoggedInFetch(app)
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
                        <div className="m-icon-show-2"><Icon source={ChecklistMajor} /><span className="m-hover-text-2"> <h1>Installation</h1></span></div></Button>

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
                        <div className="planComparison2">
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


                </Layout>
            </Page>
        </Frame >

    );
}



