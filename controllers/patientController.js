const Patient = require('../models/patient');
const SmartBed = require("../models/smartbed");
const bedStatusEnum = ['occupied','vacant'];

const createPatient = async(req, res) => {
    try {
        const patient = new Patient({
            "name": req.body.name,
            "nric": req.body.nric,
            "condition": req.body.condition,
            "addInfo": req.body.addInfo,
            "copd": req.body.copd,            
        }) 
        const res = await Patient.create(patient);
        res.status(res.status).json({ success: true, data: patient });
      } catch (e) {
        if (e.name === "ValidationError") {
          const validationErrors = Object.values(e.errors).map((e) => e.message);
          return res.status(400).json({ validationErrors });
        } else {
          res.status(500).json({ success: e.message });
        }
      }
}

const getPatients = async(req, res) => {
    try {
        const patients = await Patient.find({});
        res.status(200).json({ success: true, data: patients });
      } catch (e) {
        console.error(e);
        res.status(500).json({ success: e.message });
      }
}

const getPatientById = async(req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id);
        if (!patient) {
          return res
            .status(404)
            .json({ message: `cannot find any patient with ID ${id}` });
        }
        res.status(200).json(patient);
      } catch (e) {
        console.error(e);
        res.status(500).json({ success: e.message });
      }
}

const getPatientsByIds = async(req, res) => {
  try {
    const idsToRetrieve = req.query.ids.split(",");
    const patients = await Promise.all(
      idsToRetrieve.map(async (id) => {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          const patient = await Patient.findById(id);
          console.log(patient);
          if (!patient) {
            res
              .status(404)
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
}
const updatePatientById = async(req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id);
        if (!patient) {
          return res.status(500).json({ message: `cannot find any patient with ID ${id}` });
        }

        const { addInfo, condition, o2Intake, consciousness, picture, alerts, reminders, reports, isDischarged} = req.body;
        if (addInfo){
            patient.addInfo = addInfo
        }
        if (condition){
            patient.condition = condition
        }
        if (o2Intake){
            patient.o2Intake = o2Intake
        }
        if (consciousness) {
            patient.consciousness = consciousness
        }
        if (picture){
            patient.picture = picture
        }
        if (alerts){
            patient.alerts = alerts
        }
        if (reminders){
            patient.reminders = reminders
        }
        if (reports){
            patient.reports = reports
        }
        if (isDischarged){
            patient.isDischarged = isDischarged;

            const smartBed = await SmartBed.findById({ patient: id });
            if(!smartBed) {
              if (!smartbed) {
                return res.status(404).json({message: `cannot find any smartbed with Patient ID ${id}`});
              }
            }
            smartBed.status = bedStatusEnum[1]
            smartBed.patient = null
            await smartBed.save();
        }

        const updatedPatient = await patient.save();
        res.status(200).json(updatedPatient);
      } catch (e) {
        if (e.name === "ValidationError") {
          const validationErrors = Object.values(e.errors).map((e) => e.message);
          return res.status(400).json({ validationErrors });
        } else {
          res.status(500).json({ success: e.message });
        }
      }
}

const deletePatientById = async(req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findByIdAndDelete(id);
        if (!patient) {
          return res.status(500).json({ message: `cannot find any patient with ID ${id}` });
        }
        res.status(200).json(patient);
      } catch (e) {
        console.error(e);
        res.status(500).json({ success: e.message });
      }
}

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    getPatientsByIds,
    updatePatientById,
    deletePatientById
}