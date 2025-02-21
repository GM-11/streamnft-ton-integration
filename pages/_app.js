import "@/styles/globals.css";
import "@/styles/styles.css";
import "@/public/static/fonts.css";
import { Fragment, useEffect } from "react";
import MainWrapper from "@/components/Reusables/MainWrapper";
import Head from "next/head";
import Toast from "@/components/Reusables/loan/Toast/Toast";
import "@rainbow-me/rainbowkit/styles.css";
import Script from "next/script";
import Router, { useRouter } from "next/router";
import { GlobalProvider } from "@/context/GlobalContext";
import AppProvider from "@/context/AppProvider";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

require("@solana/wallet-adapter-react-ui/styles.css");

Router.events.on("routeChangeComplete", (url) => {
  window.analytics.page(url);
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call it once to set initial value

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openDemoLink = () => {
    const links = {
      mart: "https://youtu.be/fcrh6PFJVlk?si=kOAjt0sL3Y_YF_zv",
      rent: "https://youtu.be/5Cybqf66Zo0?si=AbytitSuKeDmwHRA",
      loan: "https://youtu.be/2u_-vn_sf8g?si=CDRixdJ3C9fANCD1",
      explore: "https://youtu.be/jvpe9o5lVJ4?si=Qo3VSUd61tSvYxGM",
      create: "https://youtu.be/WW03nVceVXo?si=sJQDAe6MWKgJWY3Z ",
    };

    const currentUrl = router.pathname;

    if (currentUrl.includes("mart")) {
      window.open(links.mart, "_blank");
    } else if (currentUrl.includes("rent")) {
      window.open(links.rent, "_blank");
    } else if (currentUrl.includes("loan")) {
      window.open(links.loan, "_blank");
    } else if (
      currentUrl.includes("utility/explore") ||
      currentUrl.includes("utility/marketplace")
    ) {
      window.open(links.explore, "_blank");
    } else if (currentUrl.includes("/utility/create")) {
      window.open(links.create, "_blank");
    }
  };

  return (
    <TonConnectUIProvider
      manifestUrl={
        "https://amber-just-earwig-230.mypinata.cloud/ipfs/bafkreif4rizf27txk3mwarxpulkkmxl5qz22iloo775vhpvx2ujzk3zmga"
      }
    >
      <Fragment>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L6L7HJ1GZD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());
           gtag('config', 'G-L6L7HJ1GZD');
        `}
        </Script>

        <Head>
          <title>StreamNFT | NFT Finance and Ownership protocol</title>
          <meta
            name="description"
            content="StreamNFT protocol is a utility layer for non-fungible tokens that unlock conditional ownership and liquidity of NFTs with rentals, loans, and token-gated access. "
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div
          className="w-fit h-[38px] px-4 whitespace-nowrap flex justify-center items-center rounded-t-lg border-0 cursor-pointer bg-[#324fbe] text-white fixed top-[30%] -right-5 z-[10000] text-sm left-auto -rotate-90 origin-center"
          onClick={() => openDemoLink()}
        >
          Demo
        </div>
        <div className="background overflow-y-scroll">
          <div className="color-bg">
            <GlobalProvider>
              <AppProvider>
                <MainWrapper>
                  <Component {...pageProps} />
                </MainWrapper>
              </AppProvider>
            </GlobalProvider>
          </div>
          <Toast />
        </div>
      </Fragment>
    </TonConnectUIProvider>
  );
}
