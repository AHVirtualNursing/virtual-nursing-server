const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const passport = require("../middleware/passport");
const generator = require("generate-password");
const Ward = require("../models/ward");
const NurseController = require("../controllers/nurseController");
const VirtualNurseController = require("../controllers/virtualNurseController");
const { body, validationResult } = require("express-validator");
const { getUserModel } = require("../helper/auth");
const { sendWelcomeEmail } = require("../helper/email");

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 1 }).escape(),
    body("email").trim().isEmail().normalizeEmail().escape(),
  ],


  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const userType = req.headers["x-usertype"];
    const userModel = getUserModel(userType);

    const { username, email } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      excludeSimilarCharacters: true,
      strict: true,
    });

    req.body.password = password;
    try {
      let newUser;
      if (userType == "mobile") {
        newUser = await NurseController.createNurse(req, res, session);
      } else if (userType == "virtual-nurse") {
        newUser = await VirtualNurseController.createVirtualNurse(req, res);
      } else {
        newUser = new userModel({ username, email, password });
      }
      await newUser.save({ session });
      await sendWelcomeEmail(email, username, password);
      await session.commitTransaction();
      session.endSession();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
      console.log(error);
    }
  }
);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during login." });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "An error occurred during login." });
      }
      return res.status(200).json({ message: "Login successful", user: user });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout();
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
