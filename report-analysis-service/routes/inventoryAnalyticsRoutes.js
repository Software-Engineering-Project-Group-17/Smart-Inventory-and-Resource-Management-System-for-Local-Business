import express from 'express';
import inventoryController from '../controllers/inventoryController.js';

const router = express.Router();
router.get('/overview', inventoryController.getOverview);
router.get('/by-category', inventoryController.getByCategory);
router.get('/stock-levels', inventoryController.getStockLevels);
router.get('/movement', inventoryController.getMovement);
router.get('/top-moving', inventoryController.getTopMoving);
router.get('/warehouse-utilization', inventoryController.getWarehouseUtilization);
router.get('/reorder-alerts', inventoryController.getReorderAlerts);
router.get('/metrics', inventoryController.getMetrics);

export default router;
