const express = require("express");
const router = express.Router();
const SmartWearable = require("../controllers/smartWearable");

router.get("/", SmartWearable.getSmartWearables);
router.get("/:id", SmartWearable.getSmartWearableById);
router.get("/serialNumber/:serialNumber", SmartWearable.getSmartWearableBySerialNumber);
router.post("/", SmartWearable.createSmartWearable);
router.put("/:id", SmartWearable.updateSmartWearableById);
router.delete("/:id", SmartWearable.deleteSmartWearableById);

module.exports = router;
