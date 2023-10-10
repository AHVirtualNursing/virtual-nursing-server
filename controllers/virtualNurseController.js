const { ObjectId } = require("mongodb");
const Nurse = require("../models/nurse");
const SmartBed = require("../models/smartbed");
const Ward = require("../models/ward");
const { virtualNurse } = require("../models/webUser");

const createVirtualNurse = async (req, res) => {
  try {
    const newVirtualNurse = new virtualNurse({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      wards: req.body.wards,
    });

    const wardIds = req.body.wards;
    for (const wardId of wardIds) {
      console.log("in vn assignment for ward part");
      const ward = await Ward.findById(wardId);
      if (!ward) {
        return res
          .status(500)
          .json({ message: `cannot find any ward with ID ${wardId}` });
      }

      ward.virtualNurse = newVirtualNurse._id;
      await ward.save();
    }

    return newVirtualNurse;
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(500).json({ success: false, error: e.message });
    }
  }
};

const getVirtualNurseById = async (req, res) => {
  try {
    const { id } = req.params;
    const nurse = await virtualNurse.findById(id);

    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${id}` });
    }
    res.status(200).json(nurse);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

const updateVirtualNurseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, wards } = req.body;
    const updateVirtualNurse = await virtualNurse.findById(id);
    if (!updateVirtualNurse) {
      return res
        .status(500)
        .json({ message: `cannot find any virtual nurse with ID ${id}` });
    }

    if (wards) {
      //unassign old wards

      const oldWards = updateVirtualNurse.wards;
      for (let i = 0; i < oldWards.length; i++) {
        const ward = oldWards[i];
        const wardInstance = await Ward.findById(ward);
        if (!wardInstance) {
          return res
            .status(500)
            .json({ message: `cannot find ward with ID ${ward}` });
        }
        wardInstance.virtualNurse = undefined;
        await wardInstance.save();
      }

      if (wards.length > 2) {
        return res.status(500).json({
          message: `virtual nurse can only be assigned a maximum of 2 wards`,
        });
      }

      //assign new wards
      for (let i = 0; i < wards.length; i++) {
        const ward = wards[i];
        const wardInstance = await Ward.findById(ward);
        if (!wardInstance) {
          return res
            .status(500)
            .json({ message: `cannot find assigned ward with ID ${ward}` });
        }
        wardInstance.virtualNurse = id;
        await wardInstance.save();
      }
      updateVirtualNurse.wards = wards;
    }
    if (name) {
      updateVirtualNurse.name = name;
    }
    if (username) {
      updateVirtualNurse.username = username;
    }
    const updatedVirtualNurse = await updateVirtualNurse.save();
    res.status(200).json(updatedVirtualNurse);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const getWardsByVirtualNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const nurse = await virtualNurse.findById(id).populate("wards");
    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any virtual nurse with ID ${id}` });
    }
    res.status(200).json(nurse.wards);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

module.exports = {
  createVirtualNurse,
  updateVirtualNurseById,
  getVirtualNurseById,
  getWardsByVirtualNurse,
};
