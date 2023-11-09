const express = require("express");
const router = express.Router();
const alert = require("../controllers/alertController");

router.post("/", alert.createAlert);
router.get("/", alert.getAllAlerts);
router.get("/:id", alert.getAlertById);
router.put("/:id", alert.updateAlertById);
router.put("/:id/followUp", alert.createFollowUpForAlert);
router.put("/redelegate/:id", alert.redelegateAlert);
router.delete("/:id", alert.deleteAlertById);

module.exports = router;
