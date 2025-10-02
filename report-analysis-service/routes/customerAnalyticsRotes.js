import express from 'express';
import customerController from '../controllers/customerController.js';

const router = express.Router();

router.get('/overview', customerController.getOverview);
router.get('/segments', customerController.getSegments);
router.get('/acquisition', customerController.getAcquisition);
router.get('/demographics', customerController.getDemographics);
router.get('/behavior', customerController.getBehavior);
router.get('/top-customers', customerController.getTopCustomers);
router.get('/retention', customerController.getRetention);
router.get('/metrics', customerController.getMetrics);

export default router;
