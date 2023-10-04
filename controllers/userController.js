const nurse = require("../models/nurse");
const { virtualNurse, itAdmin } = require("../models/webUser");
const axios = require("axios");
const bcrypt = require("bcrypt");

const getVirtualNurses = async (req, res) => {
  try {
    const virtualNurses = await virtualNurse.find({});
    res.status(200).json({ success: true, data: virtualNurses });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const getItAdmins = async (req, res) => {
  try {
    const itAdmins = await itAdmin.find({});
    res.status(200).json({ success: true, data: itAdmins });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;
    const userType = req.headers["x-usertype"];
    switch (userType) {
      case "it-admin":
        user = await itAdmin.findById(id);
        break;
      case "virtual-nurse":
        user = await virtualNurse.findById(id);
        break;
      case "bedside-nurse":
        user = await nurse.findById(id);
        break;
    }
    if (user != null) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(401).json({ success: false, message: "No user found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;
    const userType = req.headers["x-usertype"];
    switch (userType) {
      case "it-admin":
        user = await itAdmin.findByIdAndDelete(id);
        break;
      case "virtual-nurse":
        user = await virtualNurse.findByIdAndDelete(id);
        break;
      case "bedside-nurse":
        try {
          await axios.delete(`http://localhost:3001/nurse/${id}`);
          return res
            .status(200)
            .json({ success: true, message: "Nurse deleted" });
        } catch (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
    }
    if (user != null) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(401).json({ success: false, message: "No user found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.params;

    let user = null;
    const userType = req.headers["x-usertype"];

    switch (userType) {
      case "it-admin":
        user = await itAdmin.findById(id);
        break;
      case "virtual-nurse":
        user = await virtualNurse.findById(id);
        break;
      case "bedside-nurse":
        user = await nurse.findById(id);
        break;
    }

    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    if (!user.passwordReset){
      user.passwordReset = true;
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getVirtualNurses,
  getItAdmins,
  getUserById,
  deleteUserById,
  changePassword,
};
