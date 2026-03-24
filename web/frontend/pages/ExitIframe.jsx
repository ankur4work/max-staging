import { useEffect } from "react";
import { Card, Layout, Page, Spinner } from "@shopify/polaris";
import { useLocation } from "react-router-dom";

export default function ExitIframe() {
  const { search } = useLocation();

  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);
      const redirectUri = params.get("redirectUri");
      if (!redirectUri) {
        return;
      }

      const decodedRedirectUri = decodeURIComponent(redirectUri);
      const url = new URL(decodedRedirectUri);

      if (url.hostname === location.hostname) {
        window.open(decodedRedirectUri, "_top");
      }
    }
  }, [search]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Spinner accessibilityLabel="Redirecting" size="large" />
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
