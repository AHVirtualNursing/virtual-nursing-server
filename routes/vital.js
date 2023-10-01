const express = require("express");
const router = express.Router();
const Vital = require("../controllers/vitalController");

router.post("/", Vital.addVitalForPatient);
router.get("/", Vital.getVitals);
router.get("/:id", Vital.getVitalById);

module.exports = router;