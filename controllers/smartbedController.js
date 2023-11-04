const SmartBed = require("../models/smartbed");
const Nurse = require("../models/nurse");
const Patient = require("../models/patient");
const Ward = require("../models/ward");

const createSmartBed = async (req, res) => {
  try {
    const smartbed = new SmartBed({
      name: req.body.name,
    });
    await smartbed.save();

    res.status(200).json({ success: true, data: smartbed });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.name) {
      return res
        .status(500)
        .json({ message: "Name of smartbed must be unique." });
    } else {
      res.status(500).json({ success: false, error: e.message });
    }
  }
};

const getSmartBeds = async (req, res) => {
  try {
    if (req.query.ids) {
      const ids = req.query.ids.split(",");
      const smartBeds = await Promise.all(
        ids.map(async (id) => {
          if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const smartBed = await SmartBed.findById(id).populate(
              "patient ward"
            );
            if (!smartBed) {
              res
                .status(500)
                .json({ message: `cannot find any smartbed with ID ${id}` });
            }
            return smartBed;
          } else {
            res.status(500).json({ message: `${id} is in wrong format` });
          }
        })
      );
      res.status(200).json(smartBeds);
    } else if (req.query.unassigned) {
      if (req.query.unassigned == "true") {
        const smartbeds = await SmartBed.find({ ward: { $exists: false } });
        res.status(200).json({ success: true, data: smartbeds });
      } else {
        const smartbeds = await SmartBed.find({ ward: { $exists: true } });
        res.status(200).json({ success: true, data: smartbeds });
      }
    } else {
      const smartbeds = await SmartBed.find({}).populate("patient ward");
      res.status(200).json({ success: true, data: smartbeds });
    }
  } catch (e) {
    res.status(500).json({ message: false, error: e.message });
  }
};

const getSmartBedById = async (req, res) => {
  try {
    const { id } = req.params;
    const smartbed = await SmartBed.findById(id).populate("patient ward");
    if (!smartbed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with ID ${id}` });
    }
    res.status(200).json(smartbed);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

const getNursesBySmartBedId = async (req, res) => {
  try {
    const { id } = req.params;
    const smartbed = await SmartBed.findById(id);
    if (!smartbed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with ID ${id}` });
    }
    const nurses = await Nurse.find({ smartBeds: { $in: [id] } });
    res.status(200).json(nurses);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

const updateSmartBedById = async (req, res) => {
  try {
    const { id } = req.params;
    const smartbed = await SmartBed.findById(id);
    if (!smartbed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with ID ${id}` });
    }

    const {
      name,
      bedStatus,
      isRightUpperRail,
      isRightLowerRail,
      isLeftUpperRail,
      isLeftLowerRail,
      isBrakeSet,
      isLowestPosition,
      isBedAlarmOn,
      bedAlarmProtocolBreachReason,
      patient,
    } = req.body;
    if (name) {
      smartbed.name = name;
    }
    if (bedStatus) {
      smartbed.bedStatus = bedStatus;
    }
    if (isRightUpperRail !== undefined) {
      smartbed.isRightUpperRail = isRightUpperRail;
    }
    if (isRightLowerRail !== undefined) {
      smartbed.isRightLowerRail = isRightLowerRail;
    }
    if (isLeftUpperRail !== undefined) {
      smartbed.isLeftUpperRail = isLeftUpperRail;
    }
    if (isLeftLowerRail !== undefined) {
      smartbed.isLeftLowerRail = isLeftLowerRail;
    }
    if (isBrakeSet !== undefined) {
      smartbed.isBrakeSet = isBrakeSet;
    }
    if (isLowestPosition !== undefined) {
      smartbed.isLowestPosition = isLowestPosition;
    }
    if (isBedAlarmOn !== undefined) {
      smartbed.isBedAlarmOn = isBedAlarmOn;
    }
    if (bedAlarmProtocolBreachReason) {
      patient.bedAlarmProtocolBreachReason = bedAlarmProtocolBreachReason;
    }

    // dont call this unless testing
    if (patient) {
      const incomingPatient = await Patient.findById(patient);
      if (incomingPatient) {
        smartbed.patient = patient;
      } else {
        res
          .status(500)
          .json({ message: `Patient with ID: ${patient} not found` });
      }
    }
    const updatedSmartBed = await smartbed.save();
    res.status(200).json(updatedSmartBed);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.name) {
      return res
        .status(500)
        .json({ message: "Name of smartbed must be unique." });
    } else {
      res.status(500).json({ success: e.message });
    }
  }
};

const unassignSmartBedFromWard = async (req, res) => {
  try {
    const { id } = req.params;
    const smartBed = await SmartBed.findById(id);
    if (!smartBed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartBed with ID ${id}` });
    }
    if (smartBed.patient != undefined) {
      return res
        .status(500)
        .json({ message: `there is a patient on the smartbed` });
    }

    const ward = await Ward.findOne({ smartBeds: { $in: [id] } });
    ward.smartBeds.pull(id);

    const bedNum = smartBed.bedNum;
    ward.beds[bedNum - 1] = 0;
    await ward.save();

    smartBed.roomNum = undefined;
    smartBed.bedNum = undefined;
    smartBed.ward = undefined;
    await smartBed.save();

    res.status(200).json(smartBed);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const assignNursesToBed = async (req, res) => {
  try {
    const { id } = req.params;
    const smartbed = await SmartBed.findById(id).populate("nurses");
    if (!smartbed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with ID ${id}` });
    }

    const { newNurses } = req.body;
    const oldNurses = smartbed.nurses;

    const updatedSmartbed = await SmartBed.findOneAndUpdate(
      { _id: id },
      { nurses: newNurses },
      {
        new: true,
        runValidators: true,
      }
    );

    if (oldNurses !== undefined && oldNurses.length > 0) {
      for (const nurseId of oldNurses) {
        await Nurse.findOneAndUpdate(
          { _id: nurseId },
          { $pull: { smartBeds: id } },
          {
            new: true,
            runValidators: true,
          }
        );
      }
    }

    if (newNurses !== undefined && newNurses.length > 0) {
      for (const nurseId of newNurses) {
        await Nurse.findOneAndUpdate(
          { _id: nurseId },
          { $push: { smartBeds: id } },
          {
            new: true,
            runValidators: true,
          }
        );
      }
    }

    res.status(200).json(updatedSmartbed);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteSmartBedById = async (req, res) => {
  try {
    const { id } = req.params;
    const smartBed = await SmartBed.findById(id);
    if (!smartBed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with ID ${id}` });
    }
    if (smartBed.patient) {
      return res.status(500).json({
        message: `smartbed with ID ${id} has a patient and cannot be deleted`,
      });
    }

    const ward = await Ward.findOne({ smartBeds: { $in: [id] } }).populate(
      "smartBeds"
    );
    if (ward !== null && ward !== undefined) {
      if (Object.keys(ward).length !== 0) {
        ward.smartBeds.pull(id);
        const bedNum = smartBed.bedNum;
        ward.beds[bedNum - 1] = 0;
        await ward.save();
      }
    }
    for (const nurseId of smartBed.nurses) {
      const nurse = await Nurse.findById(nurseId);
      if (nurse) {
        nurse.smartBeds.pull(id); // Remove the nurse's ID from the list of nurses
        await nurse.save();
      }
    }
    await SmartBed.deleteOne({ _id: id });
    res.status(200).json(smartBed);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

module.exports = {
  createSmartBed,
  getSmartBeds,
  getSmartBedById,
  getNursesBySmartBedId,
  updateSmartBedById,
  unassignSmartBedFromWard,
  assignNursesToBed,
  deleteSmartBedById,
};
