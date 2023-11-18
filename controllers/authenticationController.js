const mongoose = require("mongoose");
const passport = require("../middleware/passport");
const generator = require("generate-password");
const NurseController = require("./nurseController");
const VirtualNurseController = require("./virtualNurseController");
const { validationResult } = require("express-validator");
const { getUserModel } = require("../helper/auth");
const { sendWelcomeEmail } = require("../helper/email");

const register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const userType = req.headers["x-usertype"];
  const userModel = getUserModel(userType);

  const { name, username, email } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      excludeSimilarCharacters: true,
      strict: true,
    });

    if (req.query.default) {
      req.body.password = "password";
      password = "password";
    } else {
      req.body.password = password;
    }

    let newUser;

    if (userType == "mobile") {
      newUser = await NurseController.createNurse(req, res, session);
    } else if (userType == "virtual-nurse") {
      newUser = await VirtualNurseController.createVirtualNurse(req, res);
    } else {
      newUser = new userModel({ name, username, email, password });
    }

    if (req.query.default) {
      newUser.passwordReset = true;
    }

    await newUser.save({ session });
    await sendWelcomeEmail(email, username, password);
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ data: { _id: newUser._id } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res, next) => {
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
        console.error(err);
        return res
          .status(500)
          .json({ message: "An error occurred during login." });
      }
      return res.status(200).json({ message: "Login successful", user: user });
    });
  })(req, res, next);
};

const logout = async(req, res) => {
    req.logout();
    res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {register, login, logout};