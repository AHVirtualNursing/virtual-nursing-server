const express = require('express');
const router = express.Router();
const SmartBed = require('../controllers/smartbedController');

router.get('/', SmartBed.getSmartBeds);
router.get('/bed/:id', SmartBed.getSmartBedById)
router.get('/beds', SmartBed.getSmartBedsByIds);
router.get('/bed/:id/nurses', SmartBed.getNursesBySmartBedId)
router.post('/', SmartBed.createSmartBed);
router.put('/:id', SmartBed.updateSmartBedById);
router.put('/:id/nurses', SmartBed.assignNursesToBed) //route similar to getNursesBySmartBed
router.delete('/:id', SmartBed.deleteSmartBedById);

module.exports = router;