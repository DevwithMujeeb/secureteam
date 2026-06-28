const express = require("express");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require("./config/env");
const auditRoutes = require("./routes/auditRoutes");

const app = express();

// --- Security middleware ---
// Sets secure HTTP headers (CSP, X-Frame-Options, HSTS, etc.)
app.use(helmet());

// Restrict cross-origin requests to the known client origin only,
// and allow cookies to be sent (needed for httpOnly refresh token cookie).
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);

// --- Body & cookie parsing ---
app.use(express.json({ limit: "10kb" })); // cap body size to mitigate large-payload abuse
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// --- Logging ---
// Use a quieter log format in production; verbose in development.
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/organizations/:orgId/audit-logs", auditRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Centralized error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
