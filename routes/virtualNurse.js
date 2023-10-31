const express = require("express");
const router = express.Router();
const VirtualNurse = require("../controllers/virtualNurseController.js");

router.post("/", VirtualNurse.createVirtualNurse)
router.put("/:id", VirtualNurse.updateVirtualNurseById);
router.get("/:id", VirtualNurse.getVirtualNurseById);
router.get("/:id/wards", VirtualNurse.getWardsByVirtualNurse);
router.put("/:virtualNurseId/ward/:wardId", VirtualNurse.unassignVirtualNurseFromWard);
router.get("/ward/:id", VirtualNurse.getVirtualNursesByWardId);

module.exports = router;