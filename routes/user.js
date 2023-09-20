const express = require("express");
const router = express.Router();
const User = require("../controllers/userController.js");

router.get("/virtualNurses", User.getVirtualNurses);
router.get("/itAdmins", User.getItAdmins);
router.get("/:id", User.getUserById);
router.delete("/:id", User.deleteUserById);
router.post("/changePassword/:id", User.changePassword)

module.exports = router;
