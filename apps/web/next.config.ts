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
};

export default nextConfig;

