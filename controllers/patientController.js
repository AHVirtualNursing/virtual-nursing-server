const Alert = require("../models/alert");
const AlertConfig = require("../models/alertConfig");
const Patient = require("../models/patient");
const SmartBed = require("../models/smartbed");
const SmartWearable = require("../models/smartWearable");
const bedStatusEnum = ["occupied", "vacant"];
const Reminder = require("../models/reminder");

const createPatient = async (req, res) => {
  try {
    const patient = new Patient({
      name: req.body.name,
      nric: req.body.nric,
      condition: req.body.condition,
      infoLogs: req.body.infoLogs,
      copd: req.body.copd,
    });
    await Patient.create(patient);
    res.status(200).json({ success: true, data: patient });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: e.message });
    }
  }
};

const getPatients = async (req, res) => {
  try {
    if (req.query.ids) {
      const ids = req.query.ids.split(",");
      const patients = await Promise.all(
        ids.map(async (id) => {
          if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const patient = await Patient.findById(id);
            console.log(patient);
            if (!patient) {
              res
                .status(500)
                .json({ message: `cannot find any patient with ID ${id}` });
            }
            return patient;
          } else {
            res.status(500).json({ message: `${id} is in wrong format` });
          }
        })
      );
      res.status(200).json(patients);
    } else {
      const patients = await Patient.find({});
      res.status(200).json({ success: true, data: patients });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` }); //status 400?
    }
    const smartWearable = await SmartWearable.findOne({ patient: id });
    const response = patient.toObject()
    if (smartWearable) {
      response.smartWearable = smartWearable;
    }
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getPatientsByIds = async (req, res) => {
  try {
    const idsToRetrieve = req.query.ids.split(",");
    const patients = await Promise.all(
      idsToRetrieve.map(async (id) => {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          const patient = await Patient.findById(id);
          console.log(patient);
          if (!patient) {
            res
              .status(500)
              .json({ message: `cannot find any patient with ID ${id}` });
          }
          return patient;
        } else {
          res.status(500).json({ message: `${id} is in wrong format` });
        }
      })
    );
    res.status(200).json(patients);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getAlertsByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    console.log(patient);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const alerts = await Alert.find({ patient: id });
    //console.log(alerts);
    res.status(200).json(alerts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getRemindersByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    console.log(patient);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const reminders = await Reminder.find({ patient: id });
    console.log(reminders);
    res.status(200).json(reminders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getVitalByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate('vital');
    console.log(patient);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const vital = await patient.vital;
    //console.log(vital);
    res.status(200).json(vital);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updatePatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const {
      infoLogs,
      condition,
      o2Intake,
      consciousness,
      picture,
      alerts,
      reminders,
      reports,
      alertConfig,
    } = req.body;

    if (infoLogs) {
      patient.infoLogs = infoLogs;
    }
    if (condition) {
      patient.condition = condition;
    }
    if (o2Intake) {
      patient.o2Intake = o2Intake;
    }
    if (consciousness) {
      patient.consciousness = consciousness;
    }
    if (picture) {
      patient.picture = picture;
    }
    if (alerts) {
      patient.alerts = alerts;
    }
    if (reminders) {
      patient.reminders = reminders;
    }
    if (reports) {
      patient.reports = reports;
    }

    if (alertConfig) {
      const alertConfigObj = await AlertConfig.findById({ _id: alertConfig });
      if (!alertConfigObj) {
        return res.status(500).json({
          message: `cannot find any alertConfig with ID ${alertConfig}`,
        });
      }
      patient.alertConfig = alertConfig;
    }

    const updatedPatient = await patient.save();
    res.status(200).json(updatedPatient);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const dischargePatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    patient.isDischarged = true;
    await patient.save();

    const smartBed = await SmartBed.findOne({ patient: id });

    console.log(smartBed);
    if (!smartBed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with Patient ID ${id}` });
    }
    smartBed.bedStatus = bedStatusEnum[1];
    smartBed.patient = null;
    await smartBed.save();

    res.status(200).json(patient);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: e.message });
    }
  }
};

const admitPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const { o2Intake, consciousness } = req.body;
    patient.o2Intake = o2Intake;
    patient.consciousness = consciousness;
    await patient.save();

    const smartBed = await SmartBed.findOne({ patient: id });

    if (!smartBed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with Patient ID ${id}` });
    }
    smartBed.bedStatus = bedStatusEnum[0];
    await smartBed.save();

    res.status(200).json(patient);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: e.message });
    }
  }
};

const deletePatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }
    res.status(200).json(patient);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  getPatientsByIds,
  getAlertsByPatientId,
  getRemindersByPatientId,
  getVitalByPatientId,
  updatePatientById,
  dischargePatientById,
  admitPatientById,
  deletePatientById,
};
