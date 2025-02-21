// Remove { Dict, Query } if not using TypeScript
import mixpanel from "mixpanel-browser";

const isProd = process.env.NODE_ENV === "production";

mixpanel.init("7067c99798e031a23756bd08f1cac5ec", {
  // Use your project's URL, adding a slug for all Mixpanel requests
  api_host: "https://rent.streamnft.tech/mp",
});

export const Mixpanel = {
  identify: (id) => {
    if (isProd) {
      mixpanel.identify(id);
    }
  },
  alias: (id) => {
    if (isProd) {
      mixpanel.alias(id);
    }
  },
  track: (name, props) => {
    if (isProd) {
      //mixpanel.track(name, props);
    }
  },
  track_links: (query, name) => {
    if (isProd) {
      mixpanel.track_links(query, name, {
        referrer: document.referrer,
      });
    }
  },
  people: {
    set: (props) => {
      if (isProd) {
        mixpanel.people.set(props);
      }
    },
  },
};
