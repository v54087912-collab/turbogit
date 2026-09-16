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
      net: { browser: "" },
      tls: { browser: "" },
      dns: { browser: "" },
      dgram: { browser: "" },
      http: { browser: "" },
      https: { browser: "" },
      fs: { browser: "" },
      child_process: { browser: "" },
      cluster: { browser: "" },
      os: { browser: "" },
      path: { browser: "" },
      readline: { browser: "" },
      stream: { browser: "" },
      util: { browser: "" },
      zlib: { browser: "" },
      crypto: { browser: "" },
      url: { browser: "" },
      assert: { browser: "" },
      buffer: { browser: "" },
      events: { browser: "" },
      querystring: { browser: "" },
      string_decoder: { browser: "" },
      timers: { browser: "" },
      tty: { browser: "" },
      vm: { browser: "" },
    },
  },
};

export default nextConfig;
