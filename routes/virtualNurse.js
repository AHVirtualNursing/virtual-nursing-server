const express = require("express");
const router = express.Router();
const VirtualNurse = require("../controllers/virtualNurseController.js");


router.get("/:id", VirtualNurse.getVirtualNurseById);

module.exports = router;