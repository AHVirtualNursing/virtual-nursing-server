const express = require("express");
const router = express.Router();
const SmartBed = require("../controllers/smartbedController");

router.get("/", SmartBed.getSmartBeds);
router.get("/:id", SmartBed.getSmartBedById);
router.get("/:id/nurses", SmartBed.getNursesBySmartBedId);
router.post("/", SmartBed.createSmartBed);
router.put("/:id", SmartBed.updateSmartBedById);
router.put("/:id/ward", SmartBed.unassignSmartBedFromWard);
router.put("/:id/nurses", SmartBed.assignNursesToBed);
router.put("/:id/reason", SmartBed.removeProtocolBreachReason);
router.delete("/:id", SmartBed.deleteSmartBedById);

module.exports = router;
