const express = require('express');
const switchController = require('../controllers/switch.controller');

const router = express.Router();

router.post('/data-switch', switchController.addDataSwitch);
router.put('/data-switch/:id', switchController.updateDataSwitch);
router.post('/airtime-switch', switchController.addAirtimeSwitch);
router.put('/airtime-switch/:id', switchController.updateAirtimeSwitch);

router.get('/airtime-switch', switchController.getAllAirtimeSwitch); // New route
router.get('/data-switch', switchController.getAllDataSwitch); // New route

module.exports = router; 