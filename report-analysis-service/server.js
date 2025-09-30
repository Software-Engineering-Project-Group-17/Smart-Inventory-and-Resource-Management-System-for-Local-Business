import express from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";

import reportRoutes from "./routes/reportRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const allowed = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map(s => s.trim());

app.use(
  cors({
    origin: allowed,           
    methods: ["GET", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,         
    maxAge: 86400
  })
);
// respond to preflight quickly
app.options("*", cors());

// Security & perf
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120
});
app.use(limiter);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/reports", reportRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`report-analysis-service running on :${PORT}`);
});
