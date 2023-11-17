const schedule = require("node-schedule");
const { Reminder } = require("../models/reminder");
const pushNotification = require("./pushNotification");
const patientController = require("../controllers/patientController");

const reminderJob = schedule.scheduleJob("* * * * * ", async () => {

  try {
    const dueReminders = await getDueReminders();
    for (const reminder of dueReminders) {
      const patient = reminder.patient._id;
      const req = { params: { id: patient } };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };
      await patientController.getNursesByPatientId(req, res);
      const nurses = res.jsonData;
      for (const nurse of nurses) {
        const body = reminder.patient.name + ": " + reminder.content; 
        await pushNotification.sendPushNotification(
          nurse.mobilePushNotificationToken,
          "Patient Reminder",
          body,
          "sendReminder",
          reminder._id.toString()
        );
      }
      if (reminder.interval != 0) {
        updateReminderNextScheduledTime(reminder);
      }
    }
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
});

async function getDueReminders() {
  try {
    const currentTime = new Date();
    const nextMinute = new Date(currentTime);
    nextMinute.setSeconds(0, 0); // Set seconds and milliseconds to 0 to get the start of the current minute
    const minuteLater = new Date(nextMinute);
    minuteLater.setMinutes(nextMinute.getMinutes() + 1); // Set to the start of the next minute

    const dueReminders = await Reminder.find({
      time: { $gte: nextMinute, $lt: minuteLater },
      isComplete: false,
    }).populate({ path: "patient" }).exec();

    return dueReminders;
  } catch (error) {
    console.error("Error retrieving due reminders:", error);
    throw error;
  }
}

module.exports = { reminderJob };
