/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration to handle potential issues
  webpack: (config, { isServer, dev }) => {
    // Handle JSON imports properly
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // Exclude problematic packages from client bundle if needed
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Exclude problematic packages from client bundle
    if (!isServer && !dev) {
      config.externals = config.externals || [];
      config.externals.push({
        'pino': 'pino',
        'pino-pretty': 'pino-pretty'
      });
    }

    return config;
  },

  // Experimental features that might help with deployment
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },

  // Ensure proper output configuration for Vercel
  output: 'standalone',
};

export default nextConfig;
