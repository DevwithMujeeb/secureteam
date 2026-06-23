require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
};

// Fail fast if critical secrets are missing — better to crash on boot
// than run with undefined JWT secrets in production.
const requiredInProduction = ["mongoUri"];
if (config.nodeEnv === "production") {
  requiredInProduction.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Missing required environment variable for: ${key}`);
    }
  });
}

module.exports = config;
