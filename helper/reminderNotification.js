const schedule = require('node-schedule');
const Reminder = require('../models/reminder'); 
const pushNotification = require('./pushNotification');
const patientController = require("../controllers/patientController");
const Patient = require("../models/patient");
const Nurse = require("../models/nurse");
const SmartBed = require("../models/smartbed");



const reminderJob = schedule.scheduleJob('* * * * * ', async () => {

    try {
        console.log("IM IN")
        const dueReminders = await getDueReminders();
        console.log(dueReminders)
        for(const reminder of dueReminders) {
            
            const patient = reminder.patient;
            const nurses = await getNursesByPatientId(patient);
            
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
      }).exec();
  
      return dueReminders;
    } catch (error) {
      console.error('Error retrieving due reminders:', error);
      throw error;
    }
  }

  const intervalToMilliseconds = {
    1: 60 * 60 * 1000, 
    2: 2 * 60 * 60 * 1000, 
    3: 3 * 60 * 60 * 1000, 
    4: 4 * 60 * 60 * 1000, 
    12: 12 * 60 * 60 * 1000,
    24: 24 * 60 * 60 * 1000, 
  
  };
  
  async function updateReminderNextScheduledTime(reminder) {
    try {
      const currentScheduledTime = reminder.time;
      const interval = reminder.interval;
      const nextScheduledTime = new Date(currentScheduledTime.getTime() + intervalToMilliseconds[interval]);
      reminder.scheduledTime = nextScheduledTime;
      await reminder.save();
    } catch (error) {
      console.error('Error updating reminder scheduled time:', error);
      throw error; 
    }
  }

  const getNursesByPatientId = async (id) => {
    try {
      // const { id } = req.params;
      const patient = await Patient.findById(id);
      if (!patient) {
        throw error();
      }
      console.log(patient)
      const bed = await SmartBed.findOne({ patient: id });
  
      if (!bed) {
        throw error();
      }
      console.log(bed)
      const nurses = await Nurse.find({ smartBeds: bed._id });
      console.log(nurses)
      return nurses;
    } catch (e) {
      console.log(e.message)
    }
  }

  module.exports = {reminderJob}