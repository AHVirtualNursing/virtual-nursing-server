const express = require("express");
const router = express.Router();
const VirtualNurse = require("../controllers/virtualNurseController.js");

router.post("/", VirtualNurse.createVirtualNurse)
router.put("/:id", VirtualNurse.updateVirtualNurseWards);
router.get("/:id", VirtualNurse.getVirtualNurseById);
router.get("/:id/wards", VirtualNurse.getWardsByVirtualNurse);

module.exports = router;