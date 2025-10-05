import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";

import reportRoutes from "./routes/reportRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import salesRoutes from './routes/salesAnalyticsRoutes.js';
import inventoryRoutes from './routes/inventoryAnalyticsRoutes.js';
import customerRoutes from './routes/customerAnalyticsRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CORS_ORIGINS || "http://localhost:3000")
      .split(",")
      .map(s => s.trim()),
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const allowed = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map(s => s.trim());

app.use(
  cors({
    origin: allowed,
    methods: ["GET", "HEAD", "OPTIONS", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400
  })
);

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

// Make io available to routes
app.set('io', io);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Subscribe to specific analytics channels
  socket.on('subscribe:analytics', (data) => {
    const { channels = [] } = data;
    channels.forEach(channel => {
      socket.join(channel);
      console.log(`Socket ${socket.id} joined ${channel}`);
    });
  });

  socket.on('unsubscribe:analytics', (data) => {
    const { channels = [] } = data;
    channels.forEach(channel => {
      socket.leave(channel);
      console.log(`Socket ${socket.id} left ${channel}`);
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Simulate real-time updates (replace with actual data sources)
setInterval(() => {
  // Business Analytics updates
  io.to('business-analytics').emit('analytics:update', {
    type: 'metrics',
    data: {
      totalRevenue: Math.random() * 50000 + 450000,
      totalOrders: Math.floor(Math.random() * 100 + 2400),
      revenueGrowth: (Math.random() * 5 - 2.5).toFixed(1)
    },
    timestamp: new Date().toISOString()
  });

  // Sales Analytics updates
  io.to('sales-analytics').emit('sales:update', {
    type: 'daily',
    data: {
      todaySales: Math.random() * 10000 + 15000,
      todayOrders: Math.floor(Math.random() * 50 + 150)
    },
    timestamp: new Date().toISOString()
  });

  // Inventory updates
  io.to('inventory-analytics').emit('inventory:update', {
    type: 'stock',
    data: {
      lowStockCount: Math.floor(Math.random() * 3 + 8),
      stockHealth: (Math.random() * 5 + 82).toFixed(1)
    },
    timestamp: new Date().toISOString()
  });

  // Customer updates
  io.to('customer-analytics').emit('customer:update', {
    type: 'metrics',
    data: {
      totalCustomers: Math.floor(Math.random() * 50 + 12500),
      newCustomers: Math.floor(Math.random() * 20 + 80)
    },
    timestamp: new Date().toISOString()
  });
}, 5000); // Update every 5 seconds

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4005;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`report-analysis-service with WebSocket running on :${PORT}`);
});


export { io };