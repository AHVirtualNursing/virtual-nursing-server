const express = require("express");
const router = express.Router();
const User = require("../controllers/userController.js");

router.get("/virtualNurses", User.getVirtualNurses);
router.get("/itAdmins", User.getItAdmins);

module.exports = router;