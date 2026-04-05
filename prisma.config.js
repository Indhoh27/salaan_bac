// prisma.config.js

// Load environment variables from .env
require("dotenv").config();

// Export Prisma config in plain CommonJS
module.exports = {
  // Path to your Prisma schema file
  schema: "prisma/schema.prisma",

  // Optional: migrations folder
  migrations: {
    path: "prisma/migrations",
  },

  // Optional: datasource config (uses DATABASE_URL from .env)
  datasource: {
    url: process.env.DATABASE_URL,
  },
};