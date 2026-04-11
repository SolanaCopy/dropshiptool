/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "ae-pic-a1.aliexpress-media.com" },
      { protocol: "https", hostname: "cf.cjdropshipping.com" },
      { protocol: "https", hostname: "**.aliexpress-media.com" },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
