const puppeteer = require("puppeteer");
const { s3 } = require("../middleware/awsClient");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { Alert } = require("../models/alert");
const AlertConfig = require("../models/alertConfig");
const Patient = require("../models/patient");
const SmartBed = require("../models/smartbed");
const SmartWearable = require("../models/smartWearable");
const bedStatusEnum = ["occupied", "vacant"];
const Reminder = require("../models/reminder");
const { Nurse } = require("../models/nurse");
const Ward = require("../models/ward");
const virtualNurse = require("../models/virtualNurse");

const createPatient = async (req, res) => {
  try {
    const patientNric = req.body.nric;
    const readmittedPatient = await Patient.findOne({
      nric: String(patientNric),
    });

    if (!readmittedPatient) {
      const patient = new Patient({
        name: req.body.name,
        nric: req.body.nric,
        condition: req.body.condition,
        infoLogs: req.body.infoLogs,
        copd: req.body.copd,
        admissionDateTime: new Date(),
      });
      newPatientRecord = await Patient.create(patient);
      res.status(200).json({ success: true, data: patient });
    } else {
      readmittedPatient.condition = req.body.condition;
      readmittedPatient.infoLogs = req.body.infoLogs;
      readmittedPatient.copd = req.body.copd;
      readmittedPatient.admissionDateTime = new Date(
        new Date().getTime() + 8 * 60 * 60 * 1000
      );
      readmittedPatient.isDischarged = false;
      readmittedPatient.dischargeDateTime = undefined;
      await readmittedPatient.save();
      res.status(200).json({ success: true, data: readmittedPatient });
    }
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else if (e.code === 11000 && e.keyPattern.name) {
      return res
        .status(500)
        .json({ message: "NRIC of patient must be unique." });
    } else {
      res.status(500).json({ success: false, data: e.message });
    }
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json(patients);
  } catch (e) {
    res.status(500).json({ error: e.message });
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
    const response = patient.toObject();
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

const getPatientByNric = async (req, res) => {
  try {
    const { nric } = req.params;
    const patient = await Patient.findOne({ nric: String(nric) });
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with NRIC ${nric}` });
    }
    res.status(200).json(patient);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getAlertsByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const alerts = await Alert.find({ patient: id });
    res.status(200).json(alerts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getRemindersByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }
    const reminders = await Reminder.find({ patient: id }).populate("patient");
    res.status(200).json(reminders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getVitalByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id).populate("vital");

    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const vital = await patient.vital;
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
      acuityLevel,
      fallRisk,
      alerts,
      reminders,
      reports,
      alertConfig,
      order,
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
    if (acuityLevel) {
      patient.acuityLevel = acuityLevel;
    }
    if (fallRisk) {
      patient.fallRisk = fallRisk;
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
    if (order) {
      patient.order = order;
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

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(process.env.DVS_DEVELOPMENT_URL, {
        waitUntil: "networkidle0",
      });

      await page.type("#identifier", process.env.DEFAULT_USERNAME);
      await page.type("#password", process.env.DEFAULT_PASSWORD);

      await page.click("#submit");
      await page.waitForNavigation();

      await page.goto(
        `${process.env.DVS_DEVELOPMENT_URL}/dischargeReport?patientId=${patient._id}&vitalId=${patient.vital}&alertConfigId=${patient.alertConfig}`,
        {
          waitUntil: "networkidle0",
        }
      );

      const pdfBuffer = await page.pdf();

      const command = new PutObjectCommand({
        Bucket: "ah-virtual-nursing",
        Key: "discharge-reports/report.pdf",
        Body: pdfBuffer,
      });

      await s3.send(command);
    } catch (error) {
      console.error(error);
    } finally {
      await browser.close();
    }

    patient.isDischarged = true;
    patient.dischargeDateTime = new Date(
      new Date().getTime() + 8 * 60 * 60 * 1000
    );
    await patient.save();

    const smartBed = await SmartBed.findOne({ patient: id });

    if (!smartBed) {
      return res
        .status(500)
        .json({ message: `cannot find any smartbed with Patient ID ${id}` });
    }
    smartBed.bedStatus = bedStatusEnum[1];
    smartBed.patient = null;
    await smartBed.save();

    const smartWearable = await SmartWearable.findOne({ patient: id });

    if (!smartWearable) {
      return res.status(500).json({
        message: `cannot find any smart wearable with Patient ID ${id}`,
      });
    }

    if (smartWearable.patient != undefined) {
      smartWearable.patient = undefined;
      await smartWearable.save();
    }

    res.status(200).json(patient);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ success: false, data: e.message });
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

    const { o2Intake, consciousness, smartWearableId } = req.body;
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

    const smartWearable = await SmartWearable.findById(smartWearableId);
    if (!smartWearable) {
      return res.status(500).json({
        message: `cannot find any smartWearable with SmartWearable ID ${id}`,
      });
    }
    smartWearable.patient = id;
    await smartWearable.save();

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

const getNursesByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(500)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    const bed = await SmartBed.findOne({ patient: id });

    if (!bed) {
      return res.status(500).json({ message: "Bed not found for the patient" });
    }

    const nurses = await Nurse.find({ smartBeds: bed._id });
    res.status(200).json(nurses);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const getVirtualNurseByPatientId = async (req, res) => {
  try {
    const { id } = req.params;
    const smartBed = await SmartBed.findOne({ patient: id });
    if (!smartBed) {
      return res
        .status(500)
        .json({ message: `cannot find any Smart Bed with Patient ID ${id}` });
    }

    const ward = await Ward.findOne({ smartBeds: smartBed._id });
    if (!ward) {
      return res.status(500).json({
        message: `cannot find any ward with Smart Bed ID ${smartBed._id}`,
      });
    }

    const vn = await virtualNurse.findOne({ wards: ward._id });
    if (!vn) {
      return res.status(500).json({
        message: `cannot find any Virtual Nurse with Ward ID ${ward._id}`,
      });
    }

    res.status(200).json(vn);
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
  getPatientByNric,
  getAlertsByPatientId,
  getRemindersByPatientId,
  getVitalByPatientId,
  getNursesByPatientId,
  updatePatientById,
  dischargePatientById,
  admitPatientById,
  deletePatientById,
  getNursesByPatientId,
  getVirtualNurseByPatientId,
};
