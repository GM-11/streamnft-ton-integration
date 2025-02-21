import Document, { Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";
import React, { useEffect } from "react";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <HotjarScript />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(){
                  var i="analytics",analytics=window[i]=window[i]||[];
                  if(!analytics.initialize)
                    if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");
                    else{
                      analytics.invoked=!0;
                      analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];
                      analytics.factory=function(e){return function(){
                        if(window[i].initialized)return window[i][e].apply(window[i],arguments);
                        var n=Array.prototype.slice.call(arguments);
                        if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){
                          var c=document.querySelector("link[rel='canonical']");
                          n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})
                        }
                        n.unshift(e);
                        analytics.push(n);
                        return analytics
                      }};
                      for(var n=0;n<analytics.methods.length;n++){
                        var key=analytics.methods[n];
                        analytics[key]=analytics.factory(key)
                      }
                      analytics.load=function(key,n){
                        var t=document.createElement("script");
                        t.type="text/javascript";
                        t.async=!0;
                        t.setAttribute("data-global-segment-analytics-key",i);
                        t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
                        var r=document.getElementsByTagName("script")[0];
                        r.parentNode.insertBefore(t,r);
                        analytics._loadOptions=n
                      };
                      analytics._writeKey="274casmHB1Qj7dNBws7PMFgoFyefxNu0";
                      analytics.SNIPPET_VERSION="5.2.0";
                      analytics.load("274casmHB1Qj7dNBws7PMFgoFyefxNu0");
                      analytics.page()
                    }
                  }();
                `,
            }}
          />
        </Head>
        <body>
          <Main />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.addEventListener("DOMContentLoaded", function() {
                  const script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3';
                  script.async = true;
                  script.defer = true;
                  script.onload = function() {
                    new Crate({
                      server: '941638636867321866', // StreamNFT
                      channel: '941638637513224217' // #💭︱general
                    });
                  };
                  document.body.appendChild(script);
                });
              `,
            }}
          />
          <NextScript />
        </body>
      </Html>
    );
  }
}

const HotjarScript = () => {
  useEffect(() => {
    (function (h, o, t, j, a, r) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
      h._hjSettings = { hjid: 5021157, hjsv: 6 };
      a = o.getElementsByTagName("head")[0];
      r = o.createElement("script");
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, "https://static.hotjar.com/c/hotjar-", ".js?sv=");
  }, []);

  return null;
};
