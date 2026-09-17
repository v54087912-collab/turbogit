import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        dns: false,
        dgram: false,
        cluster: false,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      net: "./empty-module.js",
      tls: "./empty-module.js",
      fs: "./empty-module.js",
      child_process: "./empty-module.js",
      dns: "./empty-module.js",
      dgram: "./empty-module.js",
      cluster: "./empty-module.js",
    },
  },
};

export default nextConfig;
