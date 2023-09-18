const express = require("express");
const router = express.Router();
const patient = require("../models/patient");
const Patient = require("../controllers/patientController");
const Smartbed = require("../models/smartbed");

router.get("/", Patient.getPatients);
router.get("/:id", Patient.getPatientById);
router.get("/patients", Patient.getPatientsByIds);
router.get("/:id/reminders", Patient.getRemindersByPatientId);
router.post("/", Patient.createPatient);
router.put("/:id", Patient.updatePatientById);
router.put("/:id/discharge", Patient.dischargePatientById);
router.put("/:id/admit", Patient.admitPatientById);
router.delete("/:id", Patient.deletePatientById);

module.exports = router;
