const express = require("express");
const router = express.Router();
const ward = require("../models/ward");
const Ward = require("../controllers/wardController");

router.get("/", Ward.getWards);
router.get("/:id", Ward.getWardById);
router.get("/:id/smartbeds", Ward.getSmartBedsByWardId);
router.get("/:id/nurses", Ward.getNursesByWardId);
router.get("/:id/alerts", Ward.getAlertsByWardId);
router.post("/", Ward.createWard);
router.put("/:id", Ward.updateWardById);
router.put("/:wardId/smartbed/:smartBedId", Ward.assignSmartBedsToWard);
router.put("/:id/nurse", Ward.assignNurseToWard);
router.put("/:id/virtualNurse", Ward.assignVirtualNurseToWard);
router.delete("/:id", Ward.deleteWardById);

module.exports = router;
