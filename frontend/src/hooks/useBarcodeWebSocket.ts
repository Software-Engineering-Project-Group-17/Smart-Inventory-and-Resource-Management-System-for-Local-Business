import { useEffect, useRef, useState, useCallback } from 'react';
import { getUserProfile } from '@/lib/auth';

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

interface UseBarcodeWebSocketReturn {
  isConnected: boolean;
  lastScannedBarcode: string | null;
  lastScanEvent: BarcodeScanEvent | null;
  connectionStatus: string;
  sendBarcode: (barcode: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

// Detect if we're on HTTPS and use appropriate WebSocket protocol
const getWebSocketUrl = (userEmail?: string) => {
  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    const host = window.location.hostname;
    const port = isSecure ? '8443' : '8080';
    const protocol = isSecure ? 'wss:' : 'ws:';
    const baseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || `${protocol}//${host}:${port}`;
    
    // Add user parameter if provided
    if (userEmail) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}user=${encodeURIComponent(userEmail)}`;
    }
    return baseUrl;
  }
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';
};

const RECONNECT_INTERVAL = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export function useBarcodeWebSocket(): UseBarcodeWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [lastScanEvent, setLastScanEvent] = useState<BarcodeScanEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  const userProfileRef = useRef(getUserProfile());

  const cleanupTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanupTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  }, [cleanupTimers]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const sendBarcode = useCallback((barcode: string) => {
    const userProfile = userProfileRef.current;
    if (!userProfile) {
      console.error('No user profile available for barcode sending');
      return;
    }

    const userId = `user_${Buffer.from(userProfile.email).toString('base64')}`;
    const success = sendMessage({
      type: 'barcode_scan',
      userId,
      barcode,
      timestamp: Date.now()
    });

    if (!success) {
      console.error('Failed to send barcode - WebSocket not connected');
    }
  }, [sendMessage]);

  const startHeartbeat = useCallback(() => {
    cleanupTimers();
    heartbeatIntervalRef.current = setInterval(() => {
      sendMessage({ type: 'heartbeat' });
    }, HEARTBEAT_INTERVAL) as unknown as number;
  }, [sendMessage, cleanupTimers]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: BarcodeMessage = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', message);
      
      switch (message.type) {
        case 'connected':
          console.log('WebSocket connected, authenticating...');
          setConnectionStatus('Authenticating...');
          
          // Authenticate user
          const userProfile = userProfileRef.current;
          if (userProfile) {
            const userId = `user_${Buffer.from(userProfile.email).toString('base64')}`;
            sendMessage({
              type: 'user_auth',
              userId,
              email: userProfile.email
            });
          }
          break;

        case 'auth_success':
          console.log('Authentication successful:', message.message);
          setIsConnected(true);
          setConnectionStatus(`Connected (${message.activeConnections || 1} devices)`);
          startHeartbeat();
          break;

        case 'auth_error':
          console.error('Authentication failed:', message.message);
          setConnectionStatus('Authentication failed');
          break;

        case 'barcode_scanned':
        case 'barcode': // Handle both message types from different server versions
          console.log('🔍 Barcode received:', message.barcode);
          if (message.barcode) {
            setLastScannedBarcode(message.barcode);
            // Create a unique scan event even for duplicate barcodes
            const scanEvent: BarcodeScanEvent = {
              barcode: message.barcode,
              timestamp: Date.now(),
              scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            setLastScanEvent(scanEvent);
          }
          break;

        case 'scan_error':
          console.error('Scan error:', message.message);
          break;

        case 'heartbeat_response':
          // Heartbeat acknowledged
          break;

        case 'error':
          console.error('WebSocket error:', message.message);
          break;

        default:
          console.log('Unknown message type:', message.type, message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [sendMessage, startHeartbeat]);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    const userProfile = userProfileRef.current;
    if (!userProfile?.email) {
      console.log('❌ Cannot connect: No user profile or email available');
      setConnectionStatus('No user profile');
      return;
    }

    try {
      setConnectionStatus('Connecting...');
      const wsUrl = getWebSocketUrl(userProfile.email);
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection opened');
        cleanupTimers();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('Disconnected');
        cleanupTimers();

        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000) {
          setConnectionStatus('Reconnecting...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_INTERVAL);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Connection error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('Connection failed');
    }
  }, [handleMessage, cleanupTimers]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Initialize connection on mount
  useEffect(() => {
    const userProfile = getUserProfile();
    if (userProfile) {
      userProfileRef.current = userProfile;
      connect();
    } else {
      setConnectionStatus('No user profile');
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Update user profile reference when it changes
  useEffect(() => {
    userProfileRef.current = getUserProfile();
  });

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