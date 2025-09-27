"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera, CameraOff, Wifi, WifiOff, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { getUserProfile } from '@/lib/auth';

export default function MobileScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  
  const searchParams = useSearchParams();
  // Prioritize URL parameter for email, then fall back to auth system
  const urlUserEmail = searchParams.get('user');
  const userProfile = getUserProfile();
  const userEmail = urlUserEmail || userProfile?.email;
  
  const [isScanning, setIsScanning] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!userEmail) {
      setError('User email is required');
      return;
    }

    const tryConnections = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const wsHost = isLocalhost ? 'localhost' : window.location.hostname;
      const isHTTPS = window.location.protocol === 'https:';
      
      // Prepare connection options
      const connections = [];
      
      if (isHTTPS) {
        // For HTTPS pages, try WSS first, then WS as fallback
        connections.push({
          url: `wss://${wsHost}:8443?user=${encodeURIComponent(userEmail)}`,
          type: 'secure',
          description: 'Secure WebSocket (WSS)'
        });
        connections.push({
          url: `ws://${wsHost}:8080?user=${encodeURIComponent(userEmail)}`,
          type: 'fallback',
          description: 'Insecure WebSocket (WS) - may be blocked'
        });
      } else {
        // For HTTP pages, try WS first
        connections.push({
          url: `ws://${wsHost}:8080?user=${encodeURIComponent(userEmail)}`,
          type: 'standard',
          description: 'WebSocket (WS)'
        });
      }

      // Try each connection in order
      for (const connection of connections) {
        try {
          console.log(`Attempting ${connection.description} connection to:`, connection.url);
          
          const ws = new WebSocket(connection.url);
          
          // Create a promise that resolves when connected or rejects on error/timeout
          const connectionPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              ws.close();
              reject(new Error(`Connection timeout for ${connection.description}`));
            }, 5000);

            ws.onopen = () => {
              clearTimeout(timeout);
              console.log(`${connection.description} connected successfully`);
              setWsConnected(true);
              setError('');
              resolve(ws);
            };

            ws.onerror = (error) => {
              clearTimeout(timeout);
              console.error(`${connection.description} error:`, error);
              reject(new Error(`${connection.description} failed`));
            };
          });

          // Wait for connection or timeout
          const connectedWs = await connectionPromise as WebSocket;
          
          // Set up successful connection handlers
          connectedWs.onclose = (event: CloseEvent) => {
            console.log(`${connection.description} disconnected. Code:`, event.code, 'Reason:', event.reason);
            setWsConnected(false);
            
            // Retry with a delay
            setTimeout(() => initializeWebSocket(), 3000);
          };

          connectedWs.onerror = (error: Event) => {
            console.error(`${connection.description} error:`, error);
            setWsConnected(false);
          };

          // Store the working connection
          wsRef.current = connectedWs;
          return; // Success - exit the function

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`${connection.description} failed:`, errorMessage);
          // Continue to next connection type
        }
      }

      // If we get here, all connections failed
      setWsConnected(false);
      setError('Failed to connect to scanner service. Please ensure WebSocket server is running.');
      console.error('All WebSocket connection attempts failed');
    };

    tryConnections().catch(error => {
      console.error('Error in connection attempts:', error);
      setError('Failed to initialize scanner connection');
    });
  }, [userEmail]);

  // Send barcode via WebSocket
  const sendBarcode = useCallback((barcode: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'barcode',
        barcode: barcode,
        timestamp: new Date().toISOString(),
        user: userEmail
      };
      
      wsRef.current.send(JSON.stringify(message));
      console.log('Barcode sent via WebSocket:', barcode);
      
      setLastScannedCode(barcode);
      setScanHistory(prev => [barcode, ...prev.slice(0, 9)]); // Keep last 10 scans
    } else {
      setError('Scanner connection not available');
    }
  }, [userEmail]);

  // Initialize camera and barcode reader
  const startCamera = useCallback(async () => {
    try {
      setCameraError('');
      setError('');
      
      // Check for HTTPS requirement on mobile
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Allow HTTP for localhost development, but warn about mobile limitations
      if (isMobile && !isSecure) {
        console.warn('Camera access on mobile typically requires HTTPS, but attempting with HTTP...');
      }

      // Check for MediaDevices API support
      if (!navigator.mediaDevices) {
        throw new Error('MediaDevices API not supported in this browser');
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }
      
      // Stop existing stream if running
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }

      // Initialize ZXing code reader if not already done
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Start decoding from camera
      scanningRef.current = true;
      setIsScanning(true);

      // Use constraints-based approach for better mobile compatibility
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      try {
        console.log('Requesting camera access with constraints:', constraints);
        
        // First try to get user media directly
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('Camera started successfully');
          
          // Start continuous scanning
          const scanLoop = () => {
            if (scanningRef.current && videoRef.current && codeReaderRef.current) {
              codeReaderRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current)
                .then((result) => {
                  if (result && scanningRef.current) {
                    const barcodeText = result.getText();
                    console.log('Barcode detected:', barcodeText);
                    
                    // Prevent duplicate scans
                    if (barcodeText !== lastScannedCode) {
                      sendBarcode(barcodeText);
                      
                      // Brief pause after successful scan to prevent duplicates
                      scanningRef.current = false;
                      setTimeout(() => {
                        scanningRef.current = true;
                        scanLoop(); // Resume scanning
                      }, 2000);
                      return;
                    }
                  }
                  
                  // Continue scanning if no result or duplicate
                  if (scanningRef.current) {
                    setTimeout(scanLoop, 100); // Try again in 100ms
                  }
                })
                .catch((error) => {
                  if (!(error instanceof NotFoundException)) {
                    console.debug('Scanning...', error.message);
                  }
                  // Continue scanning even if no barcode found
                  if (scanningRef.current) {
                    setTimeout(scanLoop, 100);
                  }
                });
            }
          };
          
          // Start the scanning loop
          scanLoop();
        }
      } catch (streamError: any) {
        console.error('Error getting user media:', streamError);
        
        // Provide more specific error messages
        if (streamError.name === 'NotAllowedError') {
          throw new Error('Camera access denied. Please allow camera permissions and try again.');
        } else if (streamError.name === 'NotFoundError') {
          throw new Error('No camera found. Please make sure your device has a camera.');
        } else if (streamError.name === 'NotSupportedError') {
          throw new Error('Camera not supported in this browser or context.');
        } else if (streamError.name === 'OverconstrainedError') {
          // Try with simpler constraints
          const simpleConstraints = { video: { facingMode: facingMode } };
          console.log('Trying with simpler constraints:', simpleConstraints);
          
          try {
            const stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              await videoRef.current.play();
              console.log('Camera started with simple constraints');
              
              // Start scanning with fallback constraints
              const scanLoop = () => {
                if (scanningRef.current && videoRef.current && codeReaderRef.current) {
                  codeReaderRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current)
                    .then((result) => {
                      if (result && scanningRef.current) {
                        const barcodeText = result.getText();
                        console.log('Barcode detected:', barcodeText);
                        
                        if (barcodeText !== lastScannedCode) {
                          sendBarcode(barcodeText);
                          scanningRef.current = false;
                          setTimeout(() => {
                            scanningRef.current = true;
                            scanLoop();
                          }, 2000);
                          return;
                        }
                      }
                      
                      if (scanningRef.current) {
                        setTimeout(scanLoop, 100);
                      }
                    })
                    .catch((error) => {
                      if (!(error instanceof NotFoundException)) {
                        console.debug('Scanning...', error.message);
                      }
                      if (scanningRef.current) {
                        setTimeout(scanLoop, 100);
                      }
                    });
                }
              };
              
              scanLoop();
            }
          } catch (fallbackError) {
            throw new Error(`Camera constraints too restrictive: ${streamError.message}`);
          }
        } else {
          throw streamError;
        }
      }

    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setCameraError(error.message || 'Failed to access camera');
      setIsScanning(false);
      scanningRef.current = false;
    }
  }, [facingMode, lastScannedCode, sendBarcode]);



  // Stop camera
  const stopCamera = useCallback(() => {
    try {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      // Also stop any direct video streams
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      scanningRef.current = false;
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  }, []);

  // Toggle camera (front/back)
  const toggleCamera = useCallback(() => {
    setFacingMode((prev: 'user' | 'environment') => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Initialize WebSocket on mount
  useEffect(() => {
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [initializeWebSocket]);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isScanning) {
      stopCamera();
      // Small delay to ensure camera is properly stopped before restarting
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stopCamera]);

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Access Required</h1>
          <p className="text-gray-600 mb-4">
            Please access the scanner through the sales page or use a direct link with user parameter.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Expected URL format:</strong>
            </p>
            <code className="text-xs bg-blue-100 p-1 rounded mt-1 block">
              https://192.168.1.4:3443/scanner?user=your-email@example.com
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Use HTTPS (port 3443) for mobile camera access
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Barcode Scanner</h1>
            <p className="text-sm text-gray-300">User: {userEmail}</p>
          </div>
          <div className="flex items-center space-x-2">
            {wsConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm">
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-600 p-4 m-4 rounded-lg">
          <p className="text-white">{error}</p>
        </div>
      )}

      {cameraError && (
        <div className="bg-yellow-600 p-4 m-4 rounded-lg">
          <p className="text-white">Camera Error: {cameraError}</p>
        </div>
      )}

      {/* Camera View */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 sm:h-80 md:h-96 object-cover bg-gray-800"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Scanner Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-2 border-green-400 w-64 h-32 rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  Point camera at barcode
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* WebSocket Connection Status & Controls */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Scanner Connection</h3>
            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-400">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>
          
          {!wsConnected && (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                Connection to scanner service failed. Attempts: {reconnectAttempts}
              </p>
              <button
                onClick={() => {
                  setReconnectAttempts(prev => prev + 1);
                  initializeWebSocket();
                }}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
              >
                Retry Connection
              </button>
              <div className="bg-yellow-900 p-3 rounded-lg">
                <p className="text-xs text-yellow-200">
                  💡 <strong>Troubleshooting:</strong>
                </p>
                <ul className="text-xs text-yellow-100 mt-1 space-y-1">
                  <li>• Ensure WebSocket server is running on port 8080</li>
                  <li>• Check if mixed content is blocked in browser</li>
                  <li>• Try using HTTP instead of HTTPS if possible</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={isScanning ? stopCamera : startCamera}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
              isScanning 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isScanning ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            <span>{isScanning ? 'Stop Scanner' : 'Start Scanner'}</span>
          </button>
          
          <button
            onClick={toggleCamera}
            disabled={!isScanning}
            className="py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Last Scanned */}
        {lastScannedCode && (
          <div className="bg-green-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Last Scanned:</span>
            </div>
            <p className="text-lg font-mono bg-green-900 p-2 rounded">{lastScannedCode}</p>
          </div>
        )}

        {/* Scanner Status */}
        <div className="bg-gray-800 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Camera:</span>
            <span className={isScanning ? 'text-green-400' : 'text-red-400'}>
              {isScanning ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Connection:</span>
            <span className={wsConnected ? 'text-green-400' : 'text-red-400'}>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Detection:</span>
            <span className="text-green-400">ZXing Library</span>
          </div>
          <div className="flex justify-between">
            <span>Camera Mode:</span>
            <span className="text-blue-400 capitalize">{facingMode}</span>
          </div>
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Recent Scans</h3>
            <div className="space-y-1">
              {scanHistory.slice(0, 5).map((code, index) => (
                <div key={index} className="text-sm font-mono bg-gray-700 p-2 rounded">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ul className="text-sm space-y-1 text-blue-100">
            <li>• Hold your phone steady</li>
            <li>• Ensure good lighting</li>
            <li>• Keep barcode centered in the frame</li>
            <li>• Only real barcodes will be detected</li>
            <li>• Scanned items will appear on the sales page</li>
          </ul>
          
          {/* Mobile Access Notice */}
          <div className="mt-4 p-3 bg-blue-800 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-300">📱 Mobile Access</h4>
            <p className="text-xs text-blue-100 mb-2">
              For camera access, use HTTPS on your mobile device:
            </p>
            <div className="bg-blue-700 p-2 rounded font-mono text-xs break-all">
              https://192.168.1.4:3443/scanner?user={userEmail}
            </div>
            <p className="text-xs text-blue-200 mt-2">
              ⚠️ <strong>Security Warning:</strong> Click "Advanced" → "Proceed to site" when prompted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}