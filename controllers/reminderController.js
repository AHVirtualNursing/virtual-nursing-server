const mongoose = require("mongoose");
const Reminder = require("../models/reminder");
const Patient = require("../models/patient");

const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({}).populate({ path: "patient" });
    res.status(200).json({ success: true, data: reminders });
  } catch (e) {
    res.status(400).json({ success: false });
  }
};

const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res
        .status(500)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }
    res.status(200).json(reminder);
  } catch (e) {
    res.status(400).json({ success: false });
  }
};

const createReminder = async (req, res) => {
  try {
    const patient = await Patient.findById({ _id: req.body.patient });
    if (!patient) {
      return res.status(500).json({
        message: `cannot find any patient with Patient ID ${req.body.patient}`,
      });
    }

    const reminder = new Reminder({
      content: req.body.content,
      createdBy: req.body.createdBy,
      patient: req.body.patient,
      time: req.body.time,
      interval: req.body.interval,
      picture: req.body.imageUri,
    });
    await reminder.save();

    //Links new Reminder to Patient
    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: patient._id },
      { $push: { reminders: reminder._id } },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({ success: true, data: reminder });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const updateReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res
        .status(500)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }

    const { content, isComplete, picture } = req.body;
    if (content) {
      reminder.content = content;
    }
    if (isComplete) {
      reminder.isComplete = isComplete;
    }
    if (picture) {
      reminder.picture = picture;
    }

    const updatedReminder = await reminder.save();
    res.status(200).json(updatedReminder);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(400).json({ success: false });
    }
  }
};

const deleteReminderById = async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res
        .status(500)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }

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
      return res.status(500).json({
        message: `cannot find any patient tagged to reminder with ID ${id}`,
      });
    }

    await Reminder.deleteOne({ _id: id });
    res.status(200).json(reminder);
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  createReminder,
  getAllReminders,
  getReminderById,
  updateReminderById,
  deleteReminderById,
};
