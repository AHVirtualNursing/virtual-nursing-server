const schedule = require('node-schedule');
const Reminder = require('../models/reminder'); 
const pushNotification = require('./pushNotification');
const patientController = require("../controllers/patientController");

const reminderJob = schedule.scheduleJob('* * * * * ', async () => {

    try {
        const dueReminders = await getDueReminders();
        for(const reminder of dueReminders) {
            
            const patient = reminder.patient;
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

            for(const nurse of nurses){
                await pushNotification.sendPushNotification(nurse.mobilePushNotificationToken, "Reminder", reminder.content);
            }
            if (reminder.interval != 0){
                updateReminderNextScheduledTime(reminder);
            }
            
        }
    } catch (error) {
        console.error('Error sending reminders:', error);
      }

})


  async function getDueReminders() {
    try {
      const currentTime = new Date();
      const nextMinute = new Date(currentTime);
      nextMinute.setSeconds(0, 0); // Set seconds and milliseconds to 0 to get the start of the current minute
      const minuteLater = new Date(nextMinute);
      minuteLater.setMinutes(nextMinute.getMinutes() + 1); // Set to the start of the next minute
  
      const dueReminders = await Reminder.find({
        time: { $gte: nextMinute, $lt: minuteLater },
        isComplete: false
      }).exec();
  
      return dueReminders;
    } catch (error) {
      console.error('Error retrieving due reminders:', error);
      throw error;
    }
  }

  // const intervalToMilliseconds = {
  //   1: 60 * 60 * 1000, 
  //   2: 2 * 60 * 60 * 1000, 
  //   3: 3 * 60 * 60 * 1000, 
  //   4: 4 * 60 * 60 * 1000, 
  //   12: 12 * 60 * 60 * 1000,
  //   24: 24 * 60 * 60 * 1000, 
  
  // };
  
  // async function updateReminderNextScheduledTime(reminder) {
  //   try {
  //     const currentScheduledTime = reminder.time;
  //     const interval = reminder.interval;
  //     const nextScheduledTime = new Date(currentScheduledTime.getTime() + intervalToMilliseconds[interval]);
  //     reminder.scheduledTime = nextScheduledTime;
  //     await reminder.save();
  //   } catch (error) {
  //     console.error('Error updating reminder scheduled time:', error);
  //     throw error; 
  //   }
  // }

  module.exports = {reminderJob}