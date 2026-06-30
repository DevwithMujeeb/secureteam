const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const config = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

// --- Security middleware ---
app.use(helmet());

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);

// --- Body & cookie parsing ---
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// --- Logging ---
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/organizations/:orgId/audit-logs", auditRoutes);
app.use("/api/organizations/:orgId/projects", projectRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Centralized error handler (must be last) ---
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
