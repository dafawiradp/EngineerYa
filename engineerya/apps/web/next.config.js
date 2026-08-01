/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubActions && repoName ? `/${repoName}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      // Book cover images served from Cloudflare R2 (public covers bucket,
      // separate from the private book-file bucket).
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

module.exports = nextConfig;
