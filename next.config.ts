import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "sequelize",
      "sequelize-typescript",
      "pg",
      "pg-hstore",
    ],
  },
  webpack: (config) => {
    config.externals.push({
      sequelize: "commonjs sequelize",
      pg: "commonjs pg",
      "pg-hstore": "commonjs pg-hstore",
    });
    return config;
  },
};

export default nextConfig;
