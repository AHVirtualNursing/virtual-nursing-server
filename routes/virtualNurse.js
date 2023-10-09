const express = require("express");
const router = express.Router();
const VirtualNurse = require("../controllers/virtualNurseController.js");

router.post("/", VirtualNurse.createVirtualNurse)
router.put("/:id", VirtualNurse.updateVirtualNurseWards);

module.exports = router;
