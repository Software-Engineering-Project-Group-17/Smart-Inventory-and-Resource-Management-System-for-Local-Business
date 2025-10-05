# Barcode Socket.IO Server

Real-time WebSocket server for barcode scanning functionality in the Smart Inventory Management System.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm start
```

## 🌐 Deployment Options

### 1. Railway (Recommended)
1. Push this folder to GitHub
2. Connect to [Railway](https://railway.app)
3. Deploy from GitHub repo
4. Copy the generated URL

### 2. Heroku
```bash
heroku create your-app-name
git push heroku main
```

### 3. Render
1. Connect GitHub repo to [Render](https://render.com)
2. Set build command: `npm install`
3. Set start command: `npm start`

### 4. DigitalOcean App Platform
1. Connect GitHub repo
2. Auto-detected Node.js app
3. Deploy

## 📋 Environment Variables

Set these in your deployment platform:

- `PORT`: Server port (automatically set by most platforms)
- `NODE_ENV`: Environment (production/development)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

## 🔗 Frontend Integration

After deployment, update your frontend `.env`:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-deployed-server.railway.app
```

## 📊 Features

- ✅ Real-time barcode scanning
- ✅ User authentication
- ✅ Session management
- ✅ Auto-cleanup of inactive sessions
- ✅ Health monitoring
- ✅ Graceful shutdown
- ✅ CORS configuration for production
- ✅ Multiple transport support (WebSocket + Polling)

## 🐛 Troubleshooting

### Connection Issues
1. Check CORS settings
2. Verify WebSocket support
3. Check firewall/proxy settings

### Authentication Issues
1. Ensure user email is provided
2. Check Socket.IO handshake data
3. Verify authentication flow

## 📈 Monitoring

The server logs:
- Connection/disconnection events
- Authentication status
- Barcode scan events
- Session cleanup
- Health status every minute