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
        dns: false,
        dgram: false,
        http: false,
        https: false,
        fs: false,
        child_process: false,
        cluster: false,
        os: false,
        path: false,
        readline: false,
        stream: false,
        util: false,
        zlib: false,
        crypto: false,
        url: false,
        assert: false,
        buffer: false,
        events: false,
        querystring: false,
        string_decoder: false,
        timers: false,
        tty: false,
        vm: false,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      net: "./empty-module.js",
      tls: "./empty-module.js",
      dns: "./empty-module.js",
      dgram: "./empty-module.js",
      http: "./empty-module.js",
      https: "./empty-module.js",
      fs: "./empty-module.js",
      child_process: "./empty-module.js",
      cluster: "./empty-module.js",
      os: "./empty-module.js",
      path: "./empty-module.js",
      readline: "./empty-module.js",
      stream: "./empty-module.js",
      util: "./empty-module.js",
      zlib: "./empty-module.js",
      crypto: "./empty-module.js",
      url: "./empty-module.js",
      assert: "./empty-module.js",
      buffer: "./empty-module.js",
      events: "./empty-module.js",
      querystring: "./empty-module.js",
      string_decoder: "./empty-module.js",
      timers: "./empty-module.js",
      tty: "./empty-module.js",
      vm: "./empty-module.js",
    },
  },
};

export default nextConfig;
