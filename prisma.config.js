// prisma.config.js

// Load environment variables from .env
require("dotenv").config();

// Export Prisma configuration in CommonJS style
module.exports = {
  // Path to your Prisma schema file
  schema: "prisma/schema.prisma",

  // Optional: you can specify migrations folder if needed
  migrations: {
    path: "prisma/migrations",
  },

  // Optional: datasource configuration (uses DATABASE_URL from .env)
  datasource: {
    url: process.env.DATABASE_URL,
  },
};