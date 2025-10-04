require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');

// Use environment PORT or default to 8080
const PORT = process.env.PORT || 8080;

class UserSession {
  constructor(socketId, email) {
    this.socketId = socketId;
    this.email = email;
    this.connectedAt = new Date();
    this.lastActivity = new Date();
  }

  updateActivity() {
    this.lastActivity = new Date();
  }
}

class BarcodeSocketIOServer {
  constructor() {
    this.userSessions = new Map();
    this.connectedUsers = new Set();
    this.init();
  }

  init() {
    console.log('🚀 Initializing Barcode Socket.IO Server...');
    
    // Create HTTP server (HTTPS is handled by the deployment platform)
    this.httpServer = http.createServer();
    
    // Initialize Socket.IO with CORS settings for production
    this.io = new Server(this.httpServer, {
      cors: {
        origin: [
          // Local development
          "http://localhost:3000",
          "https://localhost:3443",
          "http://192.168.50.154:3000",
          "https://192.168.50.154:3443",
          // Vercel deployment
          "https://smart-inventory-and-resource-manage.vercel.app",
          "https://smart-inventory-and-resource-manage-indol.vercel.app",
          // Allow any subdomain for flexibility
          /\.vercel\.app$/
        ],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    this.startServer();
    this.startHealthCheck();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id} from ${socket.handshake.address}`);
      
      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected to barcode server',
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      });

      // Auto-authenticate if user email is provided in handshake
      const initialEmail = socket.handshake.query.user || socket.handshake.auth?.userEmail;
      if (initialEmail) {
        console.log(`🔐 Auto-authenticating user: ${initialEmail}`);
        this.authenticateUser(socket, initialEmail);
      }

      // Handle user authentication
      socket.on('user_auth', (data) => {
        console.log(`🔐 Manual authentication request:`, data);
        if (data && data.email) {
          this.authenticateUser(socket, data.email);
        } else {
          socket.emit('auth_error', { 
            message: 'Email is required for authentication',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle barcode scanning
      socket.on('barcode_scan', (data) => {
        this.handleBarcodeData(socket, data);
      });

      // Handle legacy barcode event
      socket.on('barcode', (data) => {
        this.handleBarcodeData(socket, data);
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        const session = this.userSessions.get(socket.id);
        if (session) {
          session.updateActivity();
        }
        socket.emit('heartbeat_response', {
          timestamp: new Date().toISOString(),
          activeConnections: this.userSessions.size
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  authenticateUser(socket, email) {
    if (!email || typeof email !== 'string') {
      socket.emit('auth_error', { 
        message: 'Valid email is required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.log(`✅ Authenticating user: ${email} (Socket: ${socket.id})`);

    // Create or update user session
    const session = new UserSession(socket.id, email);
    this.userSessions.set(socket.id, session);
    this.connectedUsers.add(email);

    // Join user-specific room for targeted messaging
    socket.join(`user_${email}`);
    
    // Send authentication success
    socket.emit('auth_success', {
      message: 'Authentication successful',
      email: email,
      timestamp: new Date().toISOString(),
      activeConnections: this.userSessions.size
    });

    console.log(`👤 User authenticated: ${email} | Total sessions: ${this.userSessions.size}`);
  }

  handleBarcodeData(socket, data) {
    const session = this.userSessions.get(socket.id);
    
    if (!session) {
      socket.emit('error', { 
        message: 'User not authenticated. Please authenticate first.',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!data || !data.barcode) {
      socket.emit('scan_error', {
        message: 'Invalid barcode data',
        timestamp: new Date().toISOString()
      });
      return;
    }

    session.updateActivity();

    const barcodeEvent = {
      type: 'barcode_scanned',
      barcode: data.barcode,
      timestamp: data.timestamp || new Date().toISOString(),
      scannedBy: session.email,
      scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user: session.email
    };

    // Broadcast to all clients in the user's room
    this.io.to(`user_${session.email}`).emit('barcode_scanned', barcodeEvent);
    
    // Also emit generic 'barcode' event for backward compatibility
    this.io.to(`user_${session.email}`).emit('barcode', barcodeEvent);

    console.log(`📱 Barcode scanned: ${data.barcode} | User: ${session.email} | Scan ID: ${barcodeEvent.scanId}`);
  }

  handleDisconnect(socket, reason) {
    const session = this.userSessions.get(socket.id);
    
    if (session) {
      console.log(`🔌 User disconnected: ${session.email} (${socket.id}) | Reason: ${reason}`);
      this.userSessions.delete(socket.id);
      
      // Check if user has other active sessions
      const hasOtherSessions = Array.from(this.userSessions.values())
        .some(s => s.email === session.email);
      
      if (!hasOtherSessions) {
        this.connectedUsers.delete(session.email);
      }
    } else {
      console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    }

    console.log(`📊 Active sessions: ${this.userSessions.size} | Active users: ${this.connectedUsers.size}`);
  }

  startServer() {
    this.httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Socket.IO Server running on port ${PORT}`);
      console.log(`🌐 Server ready for connections`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', this.shutdown.bind(this));
    process.on('SIGINT', this.shutdown.bind(this));
  }

  startHealthCheck() {
    // Clean up inactive sessions every 5 minutes
    setInterval(() => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      for (const [socketId, session] of this.userSessions.entries()) {
        if (session.lastActivity < fiveMinutesAgo) {
          console.log(`🧹 Cleaning up inactive session: ${session.email} (${socketId})`);
          this.userSessions.delete(socketId);
          this.connectedUsers.delete(session.email);
        }
      }
    }, 5 * 60 * 1000);

    // Log status every minute
    setInterval(() => {
      console.log(`📊 Status: ${this.userSessions.size} active sessions, ${this.connectedUsers.size} unique users`);
    }, 60 * 1000);
  }

  shutdown() {
    console.log('🛑 Shutting down server...');
    
    // Notify all connected clients
    this.io.emit('server_shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString()
    });

    // Close server
    this.httpServer.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  }
}

// Start the server
console.log('🔧 Starting Barcode Socket.IO Server...');
new BarcodeSocketIOServer();