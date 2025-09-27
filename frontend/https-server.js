const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;
const httpsPort = 3443;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Try to load SSL certificates
  let httpsOptions = null;
  
  try {
    const certPath = path.join(__dirname, 'certificates');
    const keyPath = path.join(certPath, 'localhost-key.pem');
    const certFilePath = path.join(certPath, 'localhost.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certFilePath),
      };
      console.log('✅ SSL certificates loaded successfully');
    } else {
      console.log('⚠️  SSL certificates not found at:', certPath);
    }
  } catch (error) {
    console.log('⚠️  Could not load SSL certificates:', error.message);
  }

  // Create HTTP server (fallback)
  const httpServer = createHttpServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`🌐 HTTP Server ready on http://${hostname}:${port}`);
    console.log(`🌐 Network: http://192.168.1.4:${port}`);
  });

  // Create HTTPS server if certificates are available
  if (httpsOptions) {
    const httpsServer = createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    httpsServer.listen(httpsPort, hostname, (err) => {
      if (err) throw err;
      console.log(`🔐 HTTPS Server ready on https://${hostname}:${httpsPort}`);
      console.log(`🔐 Network: https://192.168.1.4:${httpsPort}`);
      console.log(`📱 Mobile Scanner: https://192.168.1.4:${httpsPort}/scanner?user=<email>`);
    });
  } else {
    console.log('❌ HTTPS server not started - certificates not available');
    console.log('📝 To enable HTTPS, ensure SSL certificates exist in ./certificates/');
  }
});