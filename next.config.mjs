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
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "static.zara.net",
      },
      {
        protocol: "https",
        hostname: "lp2.hm.com",
      },
      {
        protocol: "https",
        hostname: "**.shein.com",
      },
    ],
  },
};

export default nextConfig;
