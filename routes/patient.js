const express = require("express");
const router = express.Router();
const Patient = require("../controllers/patientController");

router.get("/", Patient.getPatients);
router.get("/:id", Patient.getPatientById);
router.get("/nric/:nric", Patient.getPatientByNric);
router.get("/:id/alerts", Patient.getAlertsByPatientId);
router.get("/:id/reminders", Patient.getRemindersByPatientId);
router.get("/:id/nurses", Patient.getNursesByPatientId);
router.get("/:id/vital", Patient.getVitalByPatientId);
router.get("/:id/smartbed", Patient.getSmartBedByPatientId);
router.get("/:id/virtualNurse", Patient.getVirtualNurseByPatientId);
router.post("/", Patient.createPatient);
router.put("/:id", Patient.updatePatientById);
router.put("/:id/discharge", Patient.dischargePatientById);
router.put("/:id/admit", Patient.admitPatientById);
router.delete("/:id", Patient.deletePatientById);

module.exports = router;
