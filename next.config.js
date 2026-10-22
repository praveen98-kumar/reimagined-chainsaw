/** @type {import('next').NextConfig} */
const withPWAInit = require("next-pwa");
const withPWA = withPWAInit({
  dest: "public",
  register: true,
});
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        pathname: "**",
        protocol: "https",
        hostname: "namdaanimages.blob.core.windows.net",
        port: "",
      },
      {
        pathname: "**",
        protocol: "https",
        hostname: "sgp1.digitaloceanspaces.com",
        port: "",
      },
    ],
    unoptimized: true,
  },
  i18n,
};

module.exports = { ...withPWA, ...nextConfig };
