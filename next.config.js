const withTM = require("next-transpile-modules")(["hashconnect"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 300,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Resolve the 'tls' module to a dummy implementation for the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tls: false,
        net: false,
        http2: false,
        dns: false,
        fs: false,
      };
    }

    return config;
  },
  async rewrites() {
    return [
      // Uncomment if you need rewrites for Mixpanel or other external services
      // {
      //   source: "/mp/lib.min.js",
      //   destination: "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js",
      // },
      // {
      //   source: "/mp/lib.js",
      //   destination: "https://cdn.mxpnl.com/libs/mixpanel-2-latest.js",
      // },
      // {
      //   source: "/mp/decide",
      //   destination: "https://decide.mixpanel.com/decide",
      // },
      // {
      //   source: "/mp/:slug",
      //   destination: "https://api.mixpanel.com/:slug",
      // },
    ];
  },
};

module.exports = withTM(nextConfig);
