const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.status(200).json({ success: true, data: patients });
  } catch (e) {
    console.error(e);
    res.status(400).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
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
      const patient = await Patient.findOne({name: name});
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
