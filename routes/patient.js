const express = require("express");
const router = express.Router();
const patient = require("../models/patient");
const Patient = require("../controllers/patientController");
const Smartbed = require("../models/smartbed");

router.get("/", Patient.getPatients);
router.get("/:id", Patient.getPatientById);
router.get("/patients", Patient.getPatientsByIds);
router.post("/", Patient.createPatient);
router.put("/:id", Patient.updatePatientById);

router.put("/dischargePatient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //Update patient
    const reqBody = { isDischarged: true };
    const patient = await patient.findOneAndUpdate({ _id: id }, reqBody, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res
        .status(404)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    //Update SmartBed
    const removePatientReqBody = { patient: null, bedStatus: "vacant" };
    const smartbed = await Smartbed.findOneAndUpdate(
      { patient: id },
      removePatientReqBody,
      { new: true, runValidators: true }
    );

    console.log("!!", smartbed);

    const updatedPatient = await patient.findById(id);
    res.status(200).json(updatedPatient);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(400).json({ success: false });
    }
  }
});

router.delete("/:id", Patient.deletePatientById);

module.exports = router;
