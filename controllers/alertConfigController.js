const AlertConfig = require("../models/alertConfig");
const Patient = require("../models/patient");

const createAlertConfig = async (req, res) => {
  try {
    const patient = await Patient.findById({ _id: req.body.patient });
    if (!patient) {
      return res.status(500).json({
        message: `cannot find any patient with Patient ID ${req.body.patient}`,
      });
    }
    const alertConfig = new AlertConfig({});
    await AlertConfig.create(alertConfig);

    patient.alertConfig = alertConfig._id;
    await patient.save();

    res.status(200).json({ success: true, data: alertConfig });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: e.message });
    }
  }
};

const getAllAlertConfigs = async (req, res) => {
  try {
    const alertConfigs = await AlertConfig.find({});
    res.status(200).json({ success: true, data: alertConfigs });
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

const getAlertConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const alertConfig = await AlertConfig.findById(id);
    if (!alertConfig) {
      return res
        .status(500)
        .json({ message: `cannot find any alertConfig with ID ${id}` });
    }
    res.status(200).json(alertConfig);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

const updateAlertConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const alertConfig = await AlertConfig.findById(id);
    if (!alertConfig) {
      return res
        .status(500)
        .json({ message: `cannot find any alertConfig with ID ${id}` });
    }
    const {
      rrConfig,
      hrConfig,
      bpSysConfig,
      bpDiaConfig,
      spO2Config,
      tempConfig,
    } = req.body;
    if (rrConfig) {
      alertConfig.rrConfig = rrConfig;
    }
    if (hrConfig) {
      alertConfig.hrConfig = hrConfig;
    }
    if (bpSysConfig) {
      alertConfig.bpSysConfig = bpSysConfig;
    }
    if (bpDiaConfig) {
      alertConfig.bpDiaConfig = bpDiaConfig;
    }
    if (spO2Config) {
      alertConfig.spO2Config = spO2Config;
    }
    if (tempConfig) {
      alertConfig.temperatureConfig = tempConfig;
    }

    const updatedAlertConfig = await alertConfig.save();
    res.status(200).json(updatedAlertConfig);
  } catch (e) {
    console.log(e);
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: false });
    }
  }
};

// should we even allow alert config to be deleted?
const deleteAlertConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const alertConfig = await AlertConfig.findById(id);
    if (!alertConfig) {
      return res
        .status(500)
        .json({ message: `cannot find any alertConfig with ID ${id}` });
    }

    //Remove link from Patient to Alert
    const updatedPatient = await Patient.findOneAndUpdate(
      { alertConfig: id },
      { $unset: { alertConfig: 1 } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPatient) {
      return res.status(500).json({
        message: `cannot find any patient tagged to this alert with ID ${alert.patient}`,
      });
    }
    await AlertConfig.deleteOne({ _id: id });
    res.status(200).json(alertConfig);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  createAlertConfig,
  getAllAlertConfigs,
  getAlertConfigById,
  updateAlertConfigById,
  deleteAlertConfigById,
};
