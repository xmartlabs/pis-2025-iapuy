/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "sequelize",
    "sequelize-typescript",
    "pg",
    "pg-hstore",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals.push({
      sequelize: "commonjs sequelize",
      pg: "commonjs pg",
      "pg-hstore": "commonjs pg-hstore",
    });
    return config;
  },
   experimental: {
    authInterrupts: true,
  },
};
 


export default nextConfig;
