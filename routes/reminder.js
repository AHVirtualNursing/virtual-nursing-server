const express = require("express");
const router = express.Router();
const Reminder = require("../models/reminder");
const Patient = require("../models/patient");

router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find({}).populate({ path: "patient" });
    res.status(200).json({ success: true, data: reminders });
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res
        .status(404)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }
    res.status(200).json(reminder);
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

//Get all Reminders of this Patient
router.get("/patient/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const reminders = await Reminder.find({ patient: id }).populate({
      path: "patient",
    });
    res.status(200).json(reminders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const patientId = req.body.patient;
    const newReminder = await Reminder.create(req.body);

    //Links new Reminder to Patient
    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: patientId },
      { $push: { reminders: newReminder._id } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPatient) {
      return res
        .status(404)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    res.status(200).json({ success: true, data: newReminder });
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
    const reminder = await Reminder.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!reminder) {
      return res
        .status(404)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }
    const updatedReminder = await Reminder.findById(id);
    res.status(200).json(updatedReminder);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(400).json({ success: false });
    }
  }
});

router.delete("/deleteReminder/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndDelete(id);

    //Remove link from Reminder to Patient
    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: reminder.patient },
      { $pull: { reminders: reminder._id } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPatient) {
      return res
        .status(404)
        .json({ message: `cannot find any patient with ID ${id}` });
    }

    if (!reminder) {
      return res
        .status(404)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }
    res.status(200).json(reminder);
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

module.exports = router;
