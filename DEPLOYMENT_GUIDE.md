# 🚀 Inventory Monitoring - Production Deployment Guide

## Overview

This guide explains how to deploy the inventory monitoring system with automated cron jobs in different production environments.

## 📋 Pre-Deployment Checklist

### Environment Variables

Set these in your production environment:

```bash
# Required
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production

# Optional - Cron Configuration
API_BASE_URL=https://yourdomain.com
LOG_LEVEL=info
CRON_TIMEOUT=30000
BRANCHES=1,2,3,4,5
```

## 🌐 Platform-Specific Deployments

### 1. Vercel (Recommended for Next.js)

#### Option A: Vercel Cron (Easiest)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/inventory-monitor",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

2. Update your monitoring API to handle both POST and GET:

```javascript
// /app/api/inventory-monitor/route.ts
export async function GET(request: NextRequest) {
  // Same logic as POST - check all branches
  const branches = [1, 2, 3, 4, 5];
  for (const branchId of branches) {
    // Monitor logic here
  }
}
```

3. Deploy to Vercel - cron will run automatically

#### Option B: External Cron Service

1. Sign up for a service like [cron-job.org](https://cron-job.org)
2. Create a job that calls: `https://yourdomain.com/api/inventory-monitor`
3. Set schedule: `*/30 * * * *` (every 30 minutes)

### 2. Railway

1. Add to your `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"

[cron]
schedule = "*/30 * * * *"
command = "node cron-inventory-monitor.js"
```

### 3. Render

1. Add to your `render.yaml`:

```yaml
services:
  - type: web
    name: inventory-app
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start

  - type: cron
    name: inventory-monitor
    env: node
    schedule: "*/30 * * * *"
    buildCommand: npm install
    startCommand: node cron-inventory-monitor.js
```

### 4. DigitalOcean App Platform

1. Add to your `.do/app.yaml`:

```yaml
name: inventory-system
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/your-repo
      branch: main
    run_command: npm start

jobs:
  - name: inventory-monitor
    source_dir: /
    github:
      repo: your-username/your-repo
      branch: main
    run_command: node cron-inventory-monitor.js
    schedule: "*/30 * * * *"
```

### 5. AWS (Advanced)

#### Using Lambda + CloudWatch

1. Create `serverless.yml`:

```yaml
service: inventory-monitor

provider:
  name: aws
  runtime: nodejs18.x

functions:
  inventoryMonitor:
    handler: lambda-handler.monitor
    events:
      - schedule: rate(30 minutes)
    environment:
      DATABASE_URL: ${env:DATABASE_URL}
      API_BASE_URL: ${env:API_BASE_URL}
```

2. Create `lambda-handler.js`:

```javascript
const monitor = require("./cron-inventory-monitor");

exports.monitor = async (event) => {
  try {
    await monitor.main();
    return { statusCode: 200, body: "Success" };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
```

### 6. Traditional VPS/Server

1. Upload your files to the server
2. Install Node.js and dependencies
3. Set up cron job:

```bash
# Edit crontab
crontab -e

# Add this line (update paths accordingly)
*/30 * * * * /usr/bin/node /var/www/app/cron-inventory-monitor.js >> /var/log/inventory-monitor.log 2>&1
```

4. Set up log rotation:

```bash
# Create /etc/logrotate.d/inventory-monitor
/var/log/inventory-monitor.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

## 🔧 Production Optimizations

### 1. Update Cron Frequency

For production, consider running every 30 minutes instead of 5:

```bash
# Change from */5 to */30
*/30 * * * * your-cron-command
```

### 2. Add Health Checks

```javascript
// Add to your cron script
const healthCheck = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};
```

### 3. Error Alerting

Consider integrating with services like:

- **Sentry** for error tracking
- **Slack/Discord** for notifications
- **Email alerts** for critical failures

### 4. Monitoring & Logs

```javascript
// Add structured logging
const winston = require("winston");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "inventory-monitor.log" }),
  ],
});
```

## 🧪 Testing in Production

1. **Deploy with debug logging**:

```bash
LOG_LEVEL=debug
```

2. **Test the API endpoint**:

```bash
curl -X POST https://yourdomain.com/api/inventory-monitor \
  -H "Content-Type: application/json" \
  -d '{"branchId": 1}'
```

3. **Monitor logs**:

```bash
# Check application logs
tail -f /var/log/inventory-monitor.log

# Check system cron logs
tail -f /var/log/cron.log
```

## 🚨 Troubleshooting

### Common Issues:

1. **Database connection timeout** - Increase timeout values
2. **API rate limits** - Add delays between requests
3. **Memory issues** - Monitor resource usage
4. **Time zone differences** - Ensure cron runs in correct timezone

### Environment-Specific Issues:

- **Vercel**: 10-second function timeout limit
- **Railway**: Memory limits on free plan
- **AWS Lambda**: 15-minute maximum execution time

## 📊 Monitoring Success

### Key Metrics to Track:

- Cron job execution frequency
- Notification creation rate
- API response times
- Error rates
- Database connection health

### Dashboard Ideas:

- Grafana for metrics visualization
- Simple admin panel showing last run status
- Email reports for daily/weekly summaries

## 🔐 Security Considerations

1. **API Security**: Add authentication for cron endpoints
2. **Environment Variables**: Never commit secrets to code
3. **Database Access**: Use read-only user for monitoring if possible
4. **Network Security**: Whitelist IP addresses if needed

## 📞 Support

If you encounter issues during deployment:

1. Check the logs first
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity
5. Verify cron job syntax

Remember: Start with a simple setup and gradually add complexity as needed!
