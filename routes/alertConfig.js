const express = require('express');
const router = express.Router();
const alertConfig = require("../controllers/alertConfigController");

router.get('/', alertConfig.getAllAlertConfigs);

router.get('/:id', alertConfig.getAlertConfigById);

router.post('/', alertConfig.createAlertConfig);

router.put('/:id', alertConfig.updateAlertConfigById);

router.delete('/:id', alertConfig.deleteAlertConfigById);

module.exports = router;