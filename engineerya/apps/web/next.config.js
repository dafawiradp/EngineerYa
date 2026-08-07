/** @type {import('next').NextConfig} */

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const basePath =
  isGitHubActions && repositoryName ? `/${repositoryName}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },

  ...(basePath && {
    basePath,
    assetPrefix: basePath,
  }),
};

module.exports = nextConfig;
