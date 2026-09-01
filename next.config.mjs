/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "img.ltwebstatic.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dsmcdn.com",
      },
    ],
  },
};

export default nextConfig;
