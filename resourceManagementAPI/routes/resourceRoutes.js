const express = require('express');
const router = express.Router();
const controller = require('../controllers/resourceController');

router.post('/', controller.addResource);
router.put('/:id', controller.updateResource);
router.put('/:id/availability', controller.setAvailability);
router.post('/:id/usage', controller.addUsage);
router.post('/:id/maintenance', controller.addMaintenance);

module.exports = router;
