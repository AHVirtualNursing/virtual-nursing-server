const { io } = require("socket.io-client");
const { Alert } = require("../models/alert");
const { Patient } = require("../models/patient");
const alertNotification = require("../helper/alertNotification");
const SERVER_URL = "http://localhost:3001";
const { sendAlert } = require("../helper/alertNotification");
const socket = io(SERVER_URL);

const createAlert = async (req, res) => {
  
  try {
    const patient = await Patient.findById({ _id: req.body.patient });
    if (!patient) {
      return res.status(500).json({
        message: `cannot find any patient with Patient ID ${req.body.patient}`,
      });
    }
    const alert = new Alert({
      description: req.body.description,
      notes: req.body.notes,
      patient: req.body.patient,
      alertVitals: req.body.alertVitals,
      alertType: req.body.alertType,
    });
    await alert.save();
    patient.alerts.push(alert._id);

    await patient.save();

    socket.emit("new-alert", alert);

    await alertNotification.sendAlert(alert);

    res.status(200).json({ success: true, data: alert });
  } catch (e) {
    if (e.name === "ValidationError") {
      console.error(e);
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      console.error(e);
      res.status(500).json({ success: false });
    }
  }
};

const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({});
    res.status(200).json({ success: true, data: alerts });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id).populate([{ path: "patient" }]);
    if (!alert) {
      res.status(500).json({ message: `cannot find any alert with ID ${id}` });
      return;
    }
    res.status(200).json(alert);
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

const updateAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      return res
        .status(500)
        .json({ message: `cannot find any alert with ID ${id}` });
    }

    const { status, description, notes, handledBy, followUps } = req.body;
    if (status) {
      alert.status = status;
    }
    if (description) {
      alert.description = description;
    }
    if (notes) {
      alert.notes = notes;
    }
    if (handledBy) {
      alert.handledBy = handledBy;
    }
    if (followUps) {
      alert.followUps = followUps;
    }

    const updatedAlert = await alert.save();
    socket.emit("update-alert", alert);
    res.status(200).json(updatedAlert);
  } catch (e) {
    console.error(e);
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const createFollowUpForAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      return res
        .status(500)
        .json({ message: `cannot find any alert with ID ${id}` });
    }

    const {
      respRate,
      heartRate,
      bloodPressureSys,
      bloodPressureDia,
      spO2,
      temperature,
    } = req.body;

    const followUp = {};

    if (respRate) {
      followUp.respRate = respRate;
    }
    if (heartRate) {
      followUp.heartRate = heartRate;
    }
    if (bloodPressureSys) {
      followUp.bloodPressureSys = bloodPressureSys;
    }
    if (bloodPressureDia) {
      followUp.bloodPressureDia = bloodPressureDia;
    }
    if (spO2) {
      followUp.spO2 = spO2;
    }
    if (temperature) {
      followUp.temperature = temperature;
    }

    alert.followUps.push(followUp);
    await alert.save();

    res.status(200).json({ success: true, data: alert });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: false });
    }
  }
};

const deleteAlertById = async (req, res) => {
  const socket = io(SERVER_URL);
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) {
      return res
        .status(500)
        .json({ message: `cannot find any alert with ID ${id}` });
    }

    //Remove link from Patient to Alert
    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: alert.patient },
      { $pull: { alerts: id } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPatient) {
      return res.status(500).json({
        message: `cannot find any patient tagged to this alert with ID ${id}`,
      });
    }

    await Alert.deleteOne({ _id: id });
    // emit delete-alert event when deleting alert to trigger update of patient's alert list
    socket.emit("delete-alert", alert);
    res.status(200).json(alert);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const redelegateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id).populate([{ path: "patient" }]);
    if (!alert) {
      res.status(500).json({ message: `cannot find any alert with ID ${id}` });
    }

    await sendAlert(alert);

    res.status(200).json(alert);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  createAlert,
  getAllAlerts,
  getAlertById,
  updateAlertById,
  createFollowUpForAlert,
  deleteAlertById,
  redelegateAlert,
};
