const express = require("express");
const router = express.Router();
const nurse = require("../controllers/nurseController");

router.post("/", nurse.createNurse);
router.get("/", nurse.getNurses);
router.get("/:id", nurse.getNurseById);
router.get("/:id/headNurse", nurse.getNursesByHeadNurseId);
router.get("/:id/smartbeds", nurse.getSmartBedsByNurseId);
router.put("/:id", nurse.updateNurseById);
router.delete("/:id", nurse.deleteNurseById);

module.exports = router;
