const express = require("express");
const router = express.Router();
const reminder = require("../controllers/reminderController");


router.get("/", reminder.getAllReminders);

router.get("/:id", reminder.getReminderById);

router.post("/", reminder.createReminder);

router.put("/:id", reminder.updateReminderById);

router.delete("/:id", reminder.deleteReminderById);

module.exports = router;
