import { useEffect, useRef, useState, useCallback } from 'react';
import { getUserProfile } from '@/lib/auth';

// Dynamic import type for Socket.IO
interface Socket {
  connected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data?: any) => void) => void;
  disconnect: () => void;
}

interface SocketIOStatic {
  (url: string, options?: any): Socket;
}

// Dynamic import function for Socket.IO
const loadSocketIO = async (): Promise<SocketIOStatic> => {
  try {
    const { io } = await import('socket.io-client');
    return io;
  } catch (error) {
    console.error('Failed to load socket.io-client:', error);
    throw new Error('Socket.IO client library not available');
  }
};

interface BarcodeMessage {
  type: 'connected' | 'auth_success' | 'auth_error' | 'barcode_scanned' | 'barcode' | 'scan_error' | 'heartbeat_response' | 'error';
  message?: string;
  barcode?: string;
  timestamp?: number;
  scannedBy?: string;
  activeConnections?: number;
  user?: string;
}

interface BarcodeScanEvent {
  barcode: string;
  timestamp: number;
  scanId: string; // Unique identifier for each scan
}

interface UseBarcodeSocketReturn {
  isConnected: boolean;
  lastScannedBarcode: string | null;
  lastScanEvent: BarcodeScanEvent | null;
  connectionStatus: string;
  sendBarcode: (barcode: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

interface UseBarcodeSocketOptions {
  userEmail?: string; // Optional user email override
}

// Get Socket.IO server URL based on environment
const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    const host = window.location.hostname;
    const port = isSecure ? '8443' : '8080';
    const protocol = isSecure ? 'https:' : 'http:';
    return process.env.NEXT_PUBLIC_SOCKET_URL || `${protocol}//${host}:${port}`;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';
};

const RECONNECT_DELAY = 5000; // 5 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds

export function useBarcodeSocket(options: UseBarcodeSocketOptions = {}): UseBarcodeSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [lastScanEvent, setLastScanEvent] = useState<BarcodeScanEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get user email from options or auth system
  const getUserEmail = useCallback(() => {
    if (options.userEmail) {
      return options.userEmail;
    }
    const userProfile = getUserProfile();
    return userProfile?.email || null;
  }, [options.userEmail]);
  
  const userEmailRef = useRef(getUserEmail());
  const isConnectingRef = useRef(false);

  const cleanupTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanupTimers();
    isConnectingRef.current = false;
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  }, [cleanupTimers]);

  const sendBarcode = useCallback((barcode: string) => {
    const userEmail = userEmailRef.current;
    if (!userEmail) {
      console.error('No user email available for barcode sending');
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('barcode_scan', {
        barcode,
        timestamp: Date.now(),
        user: userEmail
      });
      console.log('📤 Barcode sent via Socket.IO:', barcode);
    } else {
      console.error('Failed to send barcode - Socket.IO not connected');
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnectingRef.current || (socketRef.current && socketRef.current.connected)) {
      return;
    }

    const userEmail = userEmailRef.current;
    if (!userEmail) {
      console.log('❌ Cannot connect: No user email available');
      setConnectionStatus('No user email available');
      return;
    }

    try {
      isConnectingRef.current = true;
      setConnectionStatus('Connecting...');
      
      const socketUrl = getSocketUrl();
      console.log('🔌 Connecting to Socket.IO server:', socketUrl);
      
      const io = await loadSocketIO();
      
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: CONNECTION_TIMEOUT,
        reconnection: false,
        auth: {
          userEmail: userEmail
        },
        query: {
          user: userEmail
        }
      });

      socketRef.current = socket;
      setupSocketListeners(socket);

    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
      setConnectionStatus('Connection failed');
      isConnectingRef.current = false;
    }
  }, [getUserEmail]);

  const setupSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => {
      console.log('� Socket.IO connected, authenticating...');
      setConnectionStatus('Authenticating...');
      isConnectingRef.current = false;
      
      const userEmail = userEmailRef.current;
      if (userEmail) {
        console.log('🔐 Authenticating user:', userEmail);
        socket.emit('user_auth', {
          email: userEmail
        });
      }
    });

    socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      isConnectingRef.current = false;
      
      if (reason !== 'io client disconnect') {
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isConnectingRef.current) {
            console.log('🔄 Auto-reconnecting...');
            connect();
          }
        }, RECONNECT_DELAY);
      }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🔌 Socket.IO connection error:', error);
      setConnectionStatus(`Connection error: ${error.message}`);
      isConnectingRef.current = false;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isConnectingRef.current) {
          console.log('🔄 Retrying connection...');
          connect();
        }
      }, RECONNECT_DELAY);
    });

    socket.on('auth_success', (data: BarcodeMessage) => {
      console.log('✅ Authentication successful:', data);
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    socket.on('auth_error', (data: BarcodeMessage) => {
      console.error('❌ Authentication failed:', data.message);
      setConnectionStatus(`Auth failed: ${data.message}`);
      disconnect();
    });

    socket.on('barcode_scanned', (data: BarcodeMessage) => {
      console.log('📥 Barcode received via Socket.IO:', data);
      
      if (data.barcode) {
        const scanEvent: BarcodeScanEvent = {
          barcode: data.barcode,
          timestamp: data.timestamp || Date.now(),
          scanId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        
        setLastScannedBarcode(data.barcode);
        setLastScanEvent(scanEvent);
        
        console.log('🎯 Barcode processed:', data.barcode);
      }
    });

    socket.on('scan_error', (data: BarcodeMessage) => {
      console.error('❌ Scan error:', data.message);
    });

    socket.on('error', (error: any) => {
      console.error('🔌 Socket.IO error:', error);
      setConnectionStatus(`Error: ${error}`);
    });

    socket.on('connection_update', (data: any) => {
      console.log('📊 Connection update:', data);
    });

  }, [disconnect, connect]);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    disconnect();
    
    const currentEmail = getUserEmail();
    if (currentEmail) {
      userEmailRef.current = currentEmail;
      setTimeout(() => {
        connect();
      }, 1000);
    } else {
      console.error('❌ Cannot reconnect: No user email available');
      setConnectionStatus('No user email available');
    }
  }, [disconnect, connect, getUserEmail]);

  useEffect(() => {
    const userEmail = getUserEmail();
    if (userEmail) {
      userEmailRef.current = userEmail;
      connect();
    } else {
      setConnectionStatus('No user email available');
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, getUserEmail]);

  useEffect(() => {
    userEmailRef.current = getUserEmail();
  }, [getUserEmail]);

  return {
    isConnected,
    lastScannedBarcode,
    lastScanEvent,
    connectionStatus,
    sendBarcode,
    reconnect,
    disconnect
  };
}