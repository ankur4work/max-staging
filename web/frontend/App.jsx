import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";

import {
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <BrowserRouter>
      <PolarisProvider>
        <QueryProvider>
          <s-app-nav>
            <s-link href="/" rel="home">
              Home
            </s-link>
            <s-link href="/install">Install</s-link>
            <s-link href="/pricing">Pricing</s-link>
            <s-link href="/support">Support</s-link>
          </s-app-nav>
          <Routes pages={pages} />
        </QueryProvider>
      </PolarisProvider>
    </BrowserRouter>
  );
}
