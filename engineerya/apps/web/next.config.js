/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      // Book cover images served from Cloudflare R2 (public covers bucket,
      // separate from the private book-file bucket).
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
};

module.exports = nextConfig;
