const express = require('express');
const router = express.Router();
const ward = require('../models/ward');
const Ward = require("../controllers/wardController");

router.get('/', Ward.getWards);

router.get('/:id', Ward.getWardById)

router.post('/', Ward.createWard);

router.put('/:id', Ward.updateWardById);

router.put('/:id/nurse', Ward.assignNurseToWard);

router.delete('/:id', Ward.deleteWardById);

module.exports = router;