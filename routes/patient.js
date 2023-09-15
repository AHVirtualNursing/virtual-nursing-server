const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");
const Smartbed = require("../models/smartbed");

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json({ success: true, data: patients });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false });
  }
});

router.get("/id/:id", async (req, res) => {
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
    res.status(400).json({ success: false });
  }
});

router.get("/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const patient = await Patient.findOne({ name: name });
    if (!patient) {
      return res
        .status(404)
        .json({ message: `cannot find any patient with name ${name}` });
    }
    res.status(200).json(patient);
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false });
  }
});

router.get("/patients", async (req, res) => {
  console.log("Hello World");
  const idsToRetrieve = req.query.ids.split(",");

  try {
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
});

router.post("/", async (req, res) => {
  try {
    const newPatient = await Patient.create(req.body);
    res.status(200).json({ success: true, data: newPatient });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(400).json({ success: false });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res
        .status(404)
        .json({ message: `cannot find any patient with ID ${id}` });
    }
    const updatedPatient = await Patient.findById(id);
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

router.put("/dischargePatient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //Update Patient
    const reqBody = { isDischarged: true };
    const patient = await Patient.findOneAndUpdate({ _id: id }, reqBody, {
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

    const updatedPatient = await Patient.findById(id);
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      return res
        .status(404)
        .json({ message: `cannot find any patient with ID ${id}` });
    }
    res.status(200).json(patient);
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false });
  }
});

module.exports = router;
