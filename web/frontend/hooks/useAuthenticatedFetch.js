export function useAuthenticatedFetch() {
  return async (uri, options) => {
    const response = await fetch(uri, options);
    checkHeadersForReauthorization(response.headers);
    return response;
  };
}

function checkHeadersForReauthorization(headers) {
  if (headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1") {
    const authUrlHeader =
      headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url") ||
      `/api/auth`;
    const destination = authUrlHeader.startsWith("/")
      ? `https://${window.location.host}${authUrlHeader}`
      : authUrlHeader;

    window.open(destination, "_top");
  }
}
