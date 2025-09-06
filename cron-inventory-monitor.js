#!/usr/bin/env node

/**
 * Inventory Monitoring Cron Job (Node.js version)
 * This script calls the inventory monitoring API for all active branches
 * Run this script periodically using cron or a task scheduler
 *
 * Usage: node cron-inventory-monitor.js
 *
 * Cron job example (every 5 minutes for testing):
 * [STAR]/5 * * * * /usr/bin/node /path/to/cron-inventory-monitor.js >> /var/log/inventory-monitor.log 2>&1
 * (Replace [STAR] with actual asterisk symbol)
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

// Configuration
// Configuration
const config = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL || "info", // 'debug', 'info', 'warn', 'error'
  timeout: parseInt(process.env.CRON_TIMEOUT) || 30000, // 30 seconds
  branches: process.env.BRANCHES
    ? process.env.BRANCHES.split(",").map(Number)
    : [1, 2, 3, 4, 5], // Default branches
  environment: process.env.NODE_ENV || "development",
};

// Logging utility
const logger = {
  debug: (msg) =>
    config.logLevel === "debug" &&
    console.log(`[DEBUG] ${new Date().toISOString()} ${msg}`),
  info: (msg) =>
    ["debug", "info"].includes(config.logLevel) &&
    console.log(`[INFO] ${new Date().toISOString()} ${msg}`),
  warn: (msg) =>
    ["debug", "info", "warn"].includes(config.logLevel) &&
    console.warn(`[WARN] ${new Date().toISOString()} ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`),
};

// HTTP request utility
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const httpModule = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: config.timeout,
    };

    const req = httpModule.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const result = {
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null,
          };
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Check inventory for a specific branch
async function checkBranchInventory(branchId) {
  logger.info(`🔍 Checking inventory for branch ${branchId}...`);

  try {
    const response = await makeRequest(
      `${config.apiBaseUrl}/api/inventory-monitor`,
      {
        method: "POST",
        body: { branchId },
      }
    );

    if (response.statusCode === 200 && response.data?.success) {
      const { summary, message } = response.data;
      logger.info(
        `✅ Branch ${branchId}: ${summary.notificationsCreated} notifications created, ${summary.lowStockItems} low stock items`
      );
      logger.debug(`Branch ${branchId} details: ${message}`);

      return {
        success: true,
        branchId,
        summary,
        message,
      };
    } else {
      logger.warn(
        `❌ Branch ${branchId}: API returned error (status: ${response.statusCode})`
      );
      logger.debug(`Response: ${JSON.stringify(response.data)}`);

      return {
        success: false,
        branchId,
        error: response.data?.error || "Unknown error",
      };
    }
  } catch (error) {
    logger.error(`❌ Branch ${branchId}: ${error.message}`);
    return {
      success: false,
      branchId,
      error: error.message,
    };
  }
}

// Get branch status (optional, to check which branches exist)
async function getBranchStatus(branchId) {
  try {
    const response = await makeRequest(
      `${config.apiBaseUrl}/api/inventory-monitor?branchId=${branchId}`
    );

    if (response.statusCode === 200 && response.data?.success) {
      return {
        exists: true,
        branchId,
        summary: response.data.summary,
      };
    }

    return { exists: false, branchId };
  } catch (error) {
    logger.debug(`Branch ${branchId} status check failed: ${error.message}`);
    return { exists: false, branchId, error: error.message };
  }
}

// Main execution function
async function main() {
  logger.info("🚀 Starting inventory monitoring cron job...");

  const results = {
    totalBranches: 0,
    successfulChecks: 0,
    failedChecks: 0,
    totalNotifications: 0,
    totalLowStockItems: 0,
    branches: [],
  };

  // Health check
  try {
    logger.debug("Performing health check...");
    const healthResponse = await makeRequest(
      `${config.apiBaseUrl}/api/inventory-monitor?branchId=1`
    );
    if (
      healthResponse.statusCode !== 200 &&
      healthResponse.statusCode !== 404
    ) {
      throw new Error(
        `Health check failed with status ${healthResponse.statusCode}`
      );
    }
    logger.debug("Health check passed");
  } catch (error) {
    logger.error(`❌ API health check failed: ${error.message}`);
    process.exit(1);
  }

  // Process each branch
  for (const branchId of config.branches) {
    results.totalBranches++;

    // Optional: Check if branch exists first
    const branchStatus = await getBranchStatus(branchId);
    if (!branchStatus.exists) {
      logger.warn(
        `⚠️  Branch ${branchId} does not exist or has no inventory items`
      );
      results.failedChecks++;
      results.branches.push({
        branchId,
        success: false,
        error: "Branch not found or no inventory",
      });
      continue;
    }

    // Monitor inventory
    const result = await checkBranchInventory(branchId);
    results.branches.push(result);

    if (result.success) {
      results.successfulChecks++;
      results.totalNotifications += result.summary?.notificationsCreated || 0;
      results.totalLowStockItems += result.summary?.lowStockItems || 0;
    } else {
      results.failedChecks++;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Summary
  logger.info("📊 Inventory monitoring summary:");
  logger.info(`   Branches checked: ${results.totalBranches}`);
  logger.info(`   Successful: ${results.successfulChecks}`);
  logger.info(`   Failed: ${results.failedChecks}`);
  logger.info(`   Total notifications created: ${results.totalNotifications}`);
  logger.info(`   Total low stock items found: ${results.totalLowStockItems}`);

  if (results.failedChecks > 0) {
    logger.warn(`⚠️  ${results.failedChecks} branch(es) failed to be checked`);
  }

  logger.info("✅ Inventory monitoring cron job completed");

  // Exit with appropriate code
  process.exit(results.failedChecks > 0 ? 1 : 0);
}

// Error handling
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error(`Main execution failed: ${error.message}`);
    process.exit(1);
  });
}
