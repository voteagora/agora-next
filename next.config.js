/** @type {import('next').NextConfig} */

const path = require("path");
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

const nextConfig = {};

module.exports = nextConfig;
