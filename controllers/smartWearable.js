const SmartWearable = require("../models/smartWearable");
const Patient = require("../models/patient");

const createSmartWearable = async (req, res) => {
  try {
    const smartWearable = new SmartWearable({
      name: req.body.name,
      serialNumber: req.body.serialNumber,
    });
    await smartWearable.save();

    res.status(200).json({ success: true, data: smartWearable });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.name) {
      return res
        .status(500)
        .json({ message: "Name of smart wearable must be unique." });
    } else {
      res.status(500).json({ success: false, error: e.message });
    }
  }
};

const getSmartWearables = async (req, res) => {
  try {
    if (req.query.ids) {
      const ids = req.query.ids.split(",");
      const smartWearables = await Promise.all(
        ids.map(async (id) => {
          if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const smartWearable = await SmartWearable.findById(id).populate(
              "patient"
            );
            if (!smartWearable) {
              res.status(500).json({
                message: `cannot find any smart wearable with ID ${id}`,
              });
            }
            return smartWearable;
          } else {
            res.status(500).json({ message: `${id} is in wrong format` });
          }
        })
      );
      res.status(200).json(smartWearables);
    } else if (req.query.unassigned) {
      const smartWearables = await SmartWearable.find({
        patient: { $exists: false },
      });
      res.status(200).json({ success: true, data: smartWearables });
    } else {
      const smartWearables = await SmartWearable.find({}).populate("patient");
      res.status(200).json({ success: true, data: smartWearables });
    }
  } catch (e) {
    res.status(500).json({ message: false, error: e.message });
  }
};

const getSmartWearableById = async (req, res) => {
  try {
    const { id } = req.params;
    const smartWearable = await SmartWearable.findById(id).populate("patient");
    if (!smartWearable) {
      return res
        .status(500)
        .json({ message: `cannot find any smart wearable with ID ${id}` });
    }
    res.status(200).json(smartWearable);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

const updateSmartWearableById = async (req, res) => {
  try {
    const { id } = req.params;
    const smartWearable = await SmartWearable.findById(id);
    if (!smartWearable) {
      return res
        .status(500)
        .json({ message: `cannot find any smart wearable with ID ${id}` });
    }

    const { name, serialNumber, patient } = req.body;

    if (name) {
      smartWearable.name = name;
    }

    if (serialNumber) {
      smartWearable.serialNumber = serialNumber;
    }

    // dont call this unless testing
    if (patient) {
      const incomingPatient = await Patient.findById(patient);
      if (!incomingPatient) {
        return res
          .status(500)
          .json({ message: `Patient with ID: ${patient} not found` });
      }
      incomingPatient.smartWearable = smartWearable;
      smartWearable.patient = patient;
      await incomingPatient.save();
    }
    await smartWearable.save();

    res.status(200).json(smartWearable);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.name) {
      return res
        .status(500)
        .json({ message: "Name of smart wearable must be unique." });
    } else {
      res.status(500).json({ success: e.message });
    }
  }
};

const unassignSmartWearableFromPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const smartWearable = await SmartWearable.findById(id);

    if (!smartWearable) {
      return res
        .status(500)
        .json({ message: `cannot find any smart wearable with ID ${id}` });
    }

    if (smartWearable.patient != undefined) {
      smartWearable.patient = undefined;
      await smartWearable.save();

      const patient = await Patient.findOne({ smartWearable: { $in: [id] } });
      patient.smartWearable = undefined;
      await patient.save();

      res.status(200).json(smartWearable);
    } else {
      return res
        .status(500)
        .json({ message: `smart wearable does not have patient assigned` });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteSmartWearableById = async (req, res) => {
  try {
    const { id } = req.params;
    const smartWearable = await SmartWearable.findById(id);
    if (!smartWearable) {
      return res
        .status(500)
        .json({ message: `cannot find any smart wearable with ID ${id}` });
    }
    if (smartWearable.patient) {
      return res.status(500).json({
        message: `smartWearable with ID ${id} has a patient and cannot be deleted`,
      });
    }
    await SmartWearable.deleteOne({ _id: id });
    res.status(200).json(smartWearable);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

module.exports = {
  createSmartWearable,
  getSmartWearables,
  getSmartWearableById,
  updateSmartWearableById,
  unassignSmartWearableFromPatient,
  deleteSmartWearableById,
};
