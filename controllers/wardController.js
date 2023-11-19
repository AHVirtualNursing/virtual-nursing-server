const Ward = require("../models/ward");
const { SmartBed } = require("../models/smartbed");
const { Nurse } = require("../models/nurse");
const { getBedsPerRoom } = require("../helper/ward");
const virtualNurse = require("../models/virtualNurse");
const { Alert } = require("../models/alert");
const mongoose = require("mongoose");

const createWard = async (req, res) => {
  try {
    const wardType = req.body.wardType;
    const numRooms = req.body.numRooms;

    const ward = new Ward({
      wardNum: req.body.wardNum,
      wardType: wardType,
      numRooms: numRooms,
    });

    const numBeds = getBedsPerRoom(wardType) * numRooms;
    ward.beds = new Array(numBeds).fill(0);

    await Ward.create(ward);
    res.status(200).json({ success: true, data: ward });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.wardNum) {
      return res
        .status(500)
        .json({ message: "WardNum of ward must be unique." });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const getWards = async (req, res) => {
  try {
    if (req.query.unassigned) {
      if (req.query.unassigned == "true") {
        const wards = await Ward.find({
          virtualNurse: { $exists: false },
        }).populate("virtualNurse");
        res.status(200).json({ success: true, data: wards });
      } else {
        const wards = await Ward.find({
          virtualNurse: { $exists: true },
        }).populate("virtualNurse");
        res.status(200).json({ success: true, data: wards });
      }
    } else {
      const wards = await Ward.find({}).populate("virtualNurse");
      res.status(200).json({ success: true, data: wards });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getWardById = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id).populate("virtualNurse");
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }
    res.status(200).json(ward);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getSmartBedsByWardId = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id).populate([
      {
        path: "smartBeds",
        populate: [
          {
            path: "patient",
          },
        ],
      },
    ]);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }
    res.status(200).json(ward.smartBeds);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const getNursesByWardId = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id).populate("nurses");
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    res.status(200).json(ward.nurses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const assignSmartBedsToWard = async (req, res) => {
  try {
    const { wardId, smartBedId } = req.params;
    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${wardId}` });
    }
    const { bedNum, roomNum } = req.body;

    const smartBed = await SmartBed.findById(smartBedId);
    if (smartBed) {
      smartBed.ward = wardId;
      smartBed.roomNum = roomNum;
      smartBed.bedNum = bedNum;
      await smartBed.save();
      ward.smartBeds.push(smartBedId);
      ward.beds[bedNum - 1] = 1;

      await ward.save();
    }

    res.status(200).json(ward);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

// use this for assignment of smartbeds to ward
const updateWardById = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const { wardNum, wardType, numRooms, virtualNurse } = req.body;

    if (virtualNurse) {
      ward.virtualNurse = virtualNurse;
    }

    if (wardNum) {
      ward.wardNum = wardNum;
    }

    if (wardType) {
      ward.wardType = wardType;
    }
    if (numRooms) {
      ward.numRooms = numRooms;
    }
    if (wardType && numRooms) {
      const numBeds = getBedsPerRoom(wardType) * numRooms;
      ward.beds = new Array(numBeds).fill(0);
    }

    const updatedWard = await ward.save();
    res.status(200).json(updatedWard);
  } catch (e) {
    console.error(e);
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.wardNum) {
      return res
        .status(500)
        .json({ message: "WardNum of ward must be unique." });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const assignNurseToWard = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const nurseId = req.body.nurse;
    const nurse = await Nurse.findById(nurseId).populate("ward");
    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${nurseId}` });
    }

    const oldWard = nurse.ward;

    await Ward.findOneAndUpdate(
      { _id: oldWard },
      { $pull: { nurses: nurseId } },
      {
        new: true,
        runValidators: true,
      }
    );

    ward.nurses.push(nurseId);
    await ward.save();

    await Nurse.findOneAndUpdate(
      { _id: nurseId },
      { ward: id },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(ward);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const assignVirtualNurseToWard = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const virtualNurseId = req.body.virtualNurse;
    const virtualNurseInstance = await virtualNurse.findById(virtualNurseId);
    if (!virtualNurseInstance) {
      return res.status(500).json({
        message: `cannot find any virtual nurse with ID ${virtualNurseId}`,
      });
    }
    if (virtualNurseInstance.wards.length > 1) {
      return res.status(500).json({
        message: `virtual nurse with ID ${virtualNurseId} cannot be assigned more than 2 wards`,
      });
    }

    
    const prevVirtualNurse = ward.virtualNurse;

    await virtualNurse.findOneAndUpdate(
      { _id: prevVirtualNurse },
      { $pull: { wards: id } },
      {
        new: true,
        runValidators: true,
      }
    );

    virtualNurseInstance.wards.push(id);
    await virtualNurseInstance.save();

    const updatedWard = await Ward.findOneAndUpdate(
      { _id: id },
      { virtualNurse: virtualNurseId },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(updatedWard);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteWardById = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const { smartBeds, nurses } = ward;

    if (smartBeds.length > 0 || nurses.length > 0) {
      return res.status(500).json({
        message: `Wards containing smartbeds or with nurses working in it cannot be deleted`,
      });
    }

    await Ward.deleteOne({ _id: id });
    res.status(200).json(ward);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

const getAlertsByWardId = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id).populate("smartBeds");
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const smartbeds = ward.smartBeds;

    const patients = [];
    for (const smartbed of smartbeds) {
      if (
        smartbed.patient &&
        mongoose.Types.ObjectId.isValid(smartbed.patient)
      ) {
        patients.push(smartbed.patient);
      }
    }
    const alerts = [];
    for (const patient of patients) {
      const patientAlerts = await Alert.find({ patient: patient });
      alerts.push(...patientAlerts);
    }

    res.status(200).json(alerts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  createWard,
  getWards,
  getWardById,
  getSmartBedsByWardId,
  getNursesByWardId,
  assignSmartBedsToWard,
  updateWardById,
  assignNurseToWard,
  assignVirtualNurseToWard,
  deleteWardById,
  getAlertsByWardId,
};
