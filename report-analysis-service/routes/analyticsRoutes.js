// routes/analytics.js - Main Analytics Routes (ESM)
import express from 'express';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Overview/Dashboard endpoints
router.get('/overview', analyticsController.getOverview);
router.get('/quick-stats', analyticsController.getQuickStats);
router.get('/quick-insights', analyticsController.getQuickInsights);

// Time-series data
router.get('/revenue-trend', analyticsController.getRevenueTrend);
router.get('/order-trend', analyticsController.getOrderTrend);

// Performance metrics
router.get('/performance-summary', analyticsController.getPerformanceSummary);
router.get('/business-alerts', analyticsController.getBusinessAlerts);

export default router;
