const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/resourceController');

router.post('/', ctrl.addResource);
router.get('/', ctrl.listResources);
router.get('/:id', ctrl.getResource);
router.put('/:id', ctrl.updateResource);
router.delete('/:id', ctrl.deleteResource);

router.put('/:id/availability', ctrl.setAvailability);

router.post('/:id/usage', ctrl.addUsage);
router.get('/:id/usage', ctrl.listUsageForResource);

module.exports = router;
