/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'file-api.mtktechlab.com'
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://chat.mtktechlab.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
