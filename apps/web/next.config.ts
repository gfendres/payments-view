import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@payments-view/constants',
    '@payments-view/domain',
    '@payments-view/application',
    '@payments-view/infrastructure',
    '@payments-view/api',
    '@payments-view/ui',
  ],
  // Add CSP headers for both development and production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vitals.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https://api.gnosispay.com https://api.coingecko.com https://cloud.walletconnect.com https://rpc.walletconnect.com https://rpc.gnosischain.com wss://rpc.gnosischain.com https://gnosis.drpc.org https://gnosis-mainnet.public.blastapi.io https://1rpc.io https://*.safe.global https://vitals.vercel-insights.com https://*.walletconnect.com https://*.walletconnect.org https://pulse.walletconnect.org wss://relay.walletconnect.com wss://*.walletconnect.com wss://relay.walletconnect.org wss://*.walletconnect.org",
              "frame-ancestors 'none'",
              "base-uri 'none'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

