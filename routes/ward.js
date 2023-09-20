const express = require('express');
const router = express.Router();
const ward = require('../models/ward');
const Ward = require("../controllers/wardController");

router.get('/', Ward.getWards);
router.get('/:id', Ward.getWardById)
router.get('/:id/smartbeds', Ward.getSmartBedsByWardId);
router.get('/:id/nurses', Ward.getNursesByWardId);
router.post('/', Ward.createWard);
router.put('/:id', Ward.updateWardById);
router.put('/:id/smartbeds', Ward.assignSmartBedsToWard);
router.put('/:id/nurse', Ward.assignNurseToWard);
router.delete('/:id', Ward.deleteWardById);

module.exports = router;