const express = require('express');
const router = express.Router();
const Device = require('../models/device');

router.get('/', async (req, res) => {
  try {
    const devices = await Device.find({});
    res.status(200).json({ success: true, data: devices });
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

router.post('/', async (req, res) => {
  try {
    const newDevice = await Device.create(req.body);
    res.status(200).json({ success: true, data: newDevice });
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

module.exports = router;
