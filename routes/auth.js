const express = require("express");
const router = express.Router();
const { body} = require("express-validator");

const authentication = require("../controllers/authenticationController");

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 1 }).escape(),
    body("email").trim().isEmail().normalizeEmail().escape(),
  ],
  authentication.register
);
router.post("/login", authentication.login);
router.post("/logout", authentication.logout);

module.exports = router;
