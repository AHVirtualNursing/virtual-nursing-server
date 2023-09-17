const express = require("express");
const router = express.Router();
const reminder = require("../controllers/reminderController");


router.get("/", reminder.getAllReminders);

router.get("/id/:id", reminder.getReminderById);

//Get all Reminders of this Patient
router.get("/patient/:id", reminder.getRemindersOfPatient );

router.post("/", reminder.createReminder);

router.put("/:id", reminder.updateReminderById);

router.delete("/deleteReminder/:id", reminder.deleteReminderById);

module.exports = router;
