/** @type {import('next').NextConfig} */

const path = require("path");
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};  

const nextConfig = {
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig
