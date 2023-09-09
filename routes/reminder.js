const express = require("express");
const router = express.Router();
const Reminder = require("../models/reminder");

router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find({});
    res.status(200).json({ success: true, data: reminders });
  } catch (e) {
    console.eror(e);
    res.status(400).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
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
    console.eror(e);
    res.status(400).json({ success: false });
  }
});

router.post("/", async (req, res) => {
  try {
    const newReminder = await Reminder.create(req.body);
    res.status(200).json({ success: true, data: newReminder });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      console.eror(e);
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
      console.eror(e);
      res.status(400).json({ success: false });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByIdAndDelete(id);
    if (!reminder) {
      return res
        .status(404)
        .json({ message: `cannot find any reminder with ID ${id}` });
    }
    res.status(200).json(reminder);
  } catch (e) {
    console.eror(e);
    res.status(400).json({ success: false });
  }
});

module.exports = router;
