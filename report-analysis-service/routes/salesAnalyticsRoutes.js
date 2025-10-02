// routes/sales.js
import express from 'express';
import salesController from '../controllers/salesController.js';


const router = express.Router();


router.get('/overview', salesController.getOverview);
router.get('/daily', salesController.getDailySales);
router.get('/by-category', salesController.getSalesByCategory);
router.get('/by-channel', salesController.getSalesByChannel);
router.get('/top-performers', salesController.getTopPerformers);
router.get('/hourly-pattern', salesController.getHourlyPattern);
router.get('/metrics', salesController.getSalesMetrics);
router.get('/goals', salesController.getSalesGoals);

export default router;
