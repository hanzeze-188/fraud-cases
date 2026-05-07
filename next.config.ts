import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 云存储图片域名（按需添加）
      // { protocol: 'https', hostname: '*.oss-cn-hangzhou.aliyuncs.com' },
      // { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
