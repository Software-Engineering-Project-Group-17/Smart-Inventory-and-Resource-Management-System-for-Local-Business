import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { IncomingMessage } from 'http';

interface UserSession {
  userId: string;
  email: string;
  connections: Set<WebSocket>;
}

interface BarcodeMessage {
  type: 'barcode_scan' | 'user_auth' | 'heartbeat';
  userId?: string;
  email?: string;
  barcode?: string;
  timestamp?: number;
}

class BarcodeWebSocketServer {
  private wss: WebSocketServer | null = null;
  private userSessions: Map<string, UserSession> = new Map();
  private port: number;

  constructor(port: number = 8080) {
    this.port = port;
  }

  start() {
    const server = createServer();
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      console.log('New WebSocket connection established');

      ws.on('message', (data: Buffer) => {
        try {
          const message: BarcodeMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.removeConnectionFromSessions(ws);
      });

      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
        this.removeConnectionFromSessions(ws);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'WebSocket connection established' 
      }));
    });

    server.listen(this.port, () => {
      console.log(`Barcode WebSocket server running on port ${this.port}`);
    });

    return server;
  }

  private handleMessage(ws: WebSocket, message: BarcodeMessage) {
    switch (message.type) {
      case 'user_auth':
        this.handleUserAuth(ws, message);
        break;
      case 'barcode_scan':
        this.handleBarcodeScann(ws, message);
        break;
      case 'heartbeat':
        ws.send(JSON.stringify({ type: 'heartbeat_response' }));
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private handleUserAuth(ws: WebSocket, message: BarcodeMessage) {
    if (!message.userId || !message.email) {
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        message: 'User ID and email are required' 
      }));
      return;
    }

    // Add or update user session
    if (!this.userSessions.has(message.userId)) {
      this.userSessions.set(message.userId, {
        userId: message.userId,
        email: message.email,
        connections: new Set()
      });
    }

    const session = this.userSessions.get(message.userId)!;
    session.connections.add(ws);

    console.log(`User ${message.email} authenticated with ${session.connections.size} active connections`);

    ws.send(JSON.stringify({ 
      type: 'auth_success', 
      message: 'Authentication successful',
      activeConnections: session.connections.size
    }));
  }

  private handleBarcodeScann(ws: WebSocket, message: BarcodeMessage) {
    if (!message.userId || !message.barcode) {
      ws.send(JSON.stringify({ 
        type: 'scan_error', 
        message: 'User ID and barcode are required' 
      }));
      return;
    }

    const session = this.userSessions.get(message.userId);
    if (!session) {
      ws.send(JSON.stringify({ 
        type: 'scan_error', 
        message: 'User not authenticated' 
      }));
      return;
    }

    // Broadcast barcode to all connections for this user
    const barcodeData = {
      type: 'barcode_scanned',
      barcode: message.barcode,
      timestamp: Date.now(),
      scannedBy: session.email
    };

    session.connections.forEach(connection => {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(barcodeData));
      }
    });

    console.log(`Barcode ${message.barcode} scanned by user ${session.email} and broadcasted to ${session.connections.size} connections`);
  }

  private removeConnectionFromSessions(ws: WebSocket) {
    this.userSessions.forEach((session, userId) => {
      if (session.connections.has(ws)) {
        session.connections.delete(ws);
        console.log(`Removed connection for user ${session.email}. Remaining: ${session.connections.size}`);
        
        // Clean up empty sessions
        if (session.connections.size === 0) {
          this.userSessions.delete(userId);
          console.log(`Removed empty session for user ${session.email}`);
        }
      }
    });
  }

  getActiveUsers() {
    return Array.from(this.userSessions.values()).map(session => ({
      userId: session.userId,
      email: session.email,
      connectionCount: session.connections.size
    }));
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('Barcode WebSocket server stopped');
    }
  }
}

export default BarcodeWebSocketServer;