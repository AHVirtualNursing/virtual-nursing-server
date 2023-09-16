const { virtualNurse, itAdmin } = require("../models/webUser");

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

module.exports = {
  getVirtualNurses,
  getItAdmins,
};
