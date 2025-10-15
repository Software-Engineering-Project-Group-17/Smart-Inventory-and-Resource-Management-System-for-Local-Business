// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";

// Routes & middleware
import reportRoutes from "./routes/reportRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import salesRoutes from "./routes/salesAnalyticsRoutes.js";
import inventoryRoutes from "./routes/inventoryAnalyticsRoutes.js";
import customerRoutes from "./routes/customerAnalyticsRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ---------- CORS ----------
const allowed = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowed,
    methods: ["GET", "HEAD", "OPTIONS", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

app.options("*", cors());

// ---------- Security & perf ----------
app.use(helmet());

// Disable compression on the SSE endpoint to avoid buffering
const shouldCompress = (req, res) => {
  if (req.path === "/api/realtime") return false;
  return compression.filter(req, res);
};
app.use(compression({ filter: shouldCompress }));

app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// ---------- Socket.IO ----------
const io = new Server(httpServer, {
  cors: { origin: allowed, methods: ["GET", "POST"], credentials: true },
  transports: ["websocket", "polling"],
  pingInterval: 20000,
  pingTimeout: 20000,
});

// Optional Bearer token for realtime channel auth
io.use((socket, next) => {
  const header = socket.handshake.headers?.authorization || "";
  const tokenFromHeader = header.startsWith("Bearer ")
    ? header.slice(7)
    : undefined;
  const token = socket.handshake.auth?.token || tokenFromHeader;
  if (process.env.REALTIME_SECRET && token !== process.env.REALTIME_SECRET) {
    return next(new Error("unauthorized"));
  }
  return next();
});

// Whitelist rooms/channels (Socket.IO only; SSE accepts any topic list)
const ALLOWED_CHANNELS = new Set([
  // coarse rooms
  "business-analytics",
  "sales-analytics",
  "inventory-analytics",
  "customer-analytics",

  // -------- analytics.* (used by AnalyticsDashboard) --------
  "analytics.overview",
  "analytics.revenue-trend",
  "analytics.order-trend",
  "analytics.business-alerts",
  "analytics.performance-summary",
  "analytics.invalidate",

  // -------- sales.* (used by SalesAnalytics) --------
  "sales.daily",
  "sales.by-category",
  "sales.by-channel",
  "sales.top-performers",
  "sales.hourly",
  "sales.metrics",
  "sales.goals",
  "sales.invalidate",

  // -------- inventory.* (used by InventoryAnalytics) --------
  "inventory.by-category",
  "inventory.stock-levels",
  "inventory.movement",
  "inventory.top-moving",
  "inventory.warehouse-utilization",
  "inventory.reorder-alerts",
  "inventory.metrics",
  "inventory.invalidate",

  // -------- customers.* (used by CustomerAnalytics) --------
  "customers.segments",
  "customers.acquisition",
  "customers.demographics",
  "customers.behavior",
  "customers.top-customers",
  "customers.retention",
  "customers.metrics",
  "customers.invalidate",
]);

// Only emit when a room has listeners (Socket.IO)
const safeEmit = (room, event, payload) => {
  const size = io.sockets.adapter.rooms.get(room)?.size || 0;
  if (size > 0) io.to(room).emit(event, payload);
};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("subscribe:analytics", ({ channels = [] } = {}) => {
    const toJoin = channels.filter((c) => ALLOWED_CHANNELS.has(c));
    toJoin.forEach((room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });
  });

  socket.on("unsubscribe:analytics", ({ channels = [] } = {}) => {
    const toLeave = channels.filter((c) => ALLOWED_CHANNELS.has(c));
    toLeave.forEach((room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left ${room}`);
    });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ---------- SSE endpoint (/api/realtime) ----------
/**
 * Supports EventSource (SSE) with query: /api/realtime?topics=a,b,c
 * Sends frames: `event: message` with JSON { topic, event, data }
 */
const sseTopicSubscribers = new Map(); // topic -> Set(res)
const sseClientTopics = new WeakMap(); // res -> Set(topic)

const sseEmit = (topic, payload) => {
  const subs = sseTopicSubscribers.get(topic);
  if (!subs || subs.size === 0) return;
  const frame = `event: message\ndata: ${JSON.stringify({
    topic,
    event: "update",
    data: payload,
  })}\n\n`;
  for (const res of subs) {
    try {
      res.write(frame);
    } catch (_) {
      // ignore broken pipes
    }
  }
};

app.get("/api/realtime", (req, res) => {
  // CORS handled globally; add SSE/proxy headers here
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx: disable buffering
  res.flushHeaders?.();

  // Parse topics
  const topics = String(req.query.topics || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Register client to topics
  const joined = new Set();
  topics.forEach((t) => {
    if (!sseTopicSubscribers.has(t)) sseTopicSubscribers.set(t, new Set());
    sseTopicSubscribers.get(t).add(res);
    joined.add(t);
  });
  sseClientTopics.set(res, joined);

  // Initial hello
  res.write(`event: message\ndata: ${JSON.stringify({ hello: true })}\n\n`);

  // Keep-alive ping every 25s
  const ping = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch (_) {}
  }, 25000);

  // Cleanup
  req.on("close", () => {
    clearInterval(ping);
    const myTopics = sseClientTopics.get(res) || new Set();
    myTopics.forEach((t) => {
      const set = sseTopicSubscribers.get(t);
      if (set) {
        set.delete(res);
        if (set.size === 0) sseTopicSubscribers.delete(t);
      }
    });
    sseClientTopics.delete(res);
  });
});

// Unified broadcast helper: hits both Socket.IO (if any listeners) and SSE
const broadcast = (topic, payload) => {
  safeEmit(topic, "realtime:update", { channel: topic, ...payload }); // Socket.IO
  sseEmit(topic, payload); // SSE
};

// ---------- Make io / broadcast available in routes ----------
app.set("io", io);
app.set("broadcast", broadcast);

// ---------- Routes ----------
app.use("/api/health", healthRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);

// ---------- Demo realtime updates (replace with real emitters in prod) ----------
setInterval(() => {
  const now = new Date().toISOString();

  // Coarse rooms (Socket.IO-only demo)
  safeEmit("business-analytics", "realtime:update", {
    channel: "business-analytics",
    type: "metrics",
    data: {
      totalRevenue: Math.random() * 50000 + 450000,
      totalOrders: Math.floor(Math.random() * 100 + 2400),
      revenueGrowth: Number((Math.random() * 5 - 2.5).toFixed(1)),
    },
    timestamp: now,
  });

  safeEmit("sales-analytics", "realtime:update", {
    channel: "sales-analytics",
    type: "daily",
    data: {
      todaySales: Math.random() * 10000 + 15000,
      todayOrders: Math.floor(Math.random() * 50 + 150),
    },
    timestamp: now,
  });

  safeEmit("inventory-analytics", "realtime:update", {
    channel: "inventory-analytics",
    type: "stock",
    data: {
      lowStockCount: Math.floor(Math.random() * 3 + 8),
      stockHealth: Number((Math.random() * 5 + 82).toFixed(1)),
    },
    timestamp: now,
  });

  safeEmit("customer-analytics", "realtime:update", {
    channel: "customer-analytics",
    type: "metrics",
    data: {
      totalCustomers: Math.floor(Math.random() * 50 + 12500),
      newCustomers: Math.floor(Math.random() * 20 + 80),
    },
    timestamp: now,
  });

  // -------- SSE/WS bridge for invalidate & granular topics --------

  // AnalyticsDashboard topics
  [
    "analytics.overview",
    "analytics.revenue-trend",
    "analytics.order-trend",
    "analytics.business-alerts",
    "analytics.performance-summary",
    "analytics.invalidate",
  ].forEach((topic) =>
    broadcast(topic, { data: { invalidate: true }, timestamp: now })
  );

  // SalesAnalytics topics
  [
    "sales.daily",
    "sales.by-category",
    "sales.by-channel",
    "sales.top-performers",
    "sales.hourly",
    "sales.metrics",
    "sales.goals",
    "sales.invalidate",
  ].forEach((topic) =>
    broadcast(topic, { data: { invalidate: true }, timestamp: now })
  );

  // InventoryAnalytics topics
  [
    "inventory.by-category",
    "inventory.stock-levels",
    "inventory.movement",
    "inventory.top-moving",
    "inventory.warehouse-utilization",
    "inventory.reorder-alerts",
    "inventory.metrics",
    "inventory.invalidate",
  ].forEach((topic) =>
    broadcast(topic, { data: { invalidate: true }, timestamp: now })
  );

  // CustomerAnalytics topics
  [
    "customers.segments",
    "customers.acquisition",
    "customers.demographics",
    "customers.behavior",
    "customers.top-customers",
    "customers.retention",
    "customers.metrics",
    "customers.invalidate",
  ].forEach((topic) =>
    broadcast(topic, { data: { invalidate: true }, timestamp: now })
  );
}, 5000);

// ---------- Error handler ----------
app.use(errorHandler);

// ---------- Start ----------
const PORT = process.env.PORT || 4005;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`report-analysis-service running on :${PORT}`);
  console.log(`Realtime: SSE at /api/realtime (WS fallback expects same path)`);
});

// Optional exports if your routes want direct access
export { io };
export const realtime = { io, broadcast };
