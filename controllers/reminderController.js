const mongoose = require("mongoose");
const Reminder = require("../models/reminder");
const Patient = require("../models/patient");

//populate patients here?
const getAllReminders = async (req, res) => {
    try {
      const reminders = await Reminder.find({}).populate({ path: "patient" });
      res.status(200).json({ success: true, data: reminders });
    } catch (e) {
      res.status(400).json({ success: false });
    }
}

const getReminderById = async (req, res) => {
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
}

const getRemindersOfPatient = async (req, res) => {
    const { id } = req.params;
    try {
        const reminders = await Reminder.find({ patient: id }).populate(
        {
            path: "patient",
        }
    );
        res.status(200).json(reminders);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
  }

const createReminder = async (req, res) => {
    try {
        const patientId = req.body.patient;
  
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

        const reminder = new Reminder({
            content: req.body.content,
            createdBy: req.body.createdBy,
            patient: req.body.patient  //verify if patient exists first
        })
            await alert.save();
        const newReminder = await Reminder.create(req.body);
    
        res.status(200).json({ success: true, data: newReminder });
    } catch (e) {
        if (e.name === "ValidationError") {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(400).json({ validationErrors });
        } else {
            res.status(400).json({ success: false });
        }
    }
  }

const updateReminderById = async (req, res) => {
    try {
        const { id } = req.params;
        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ message: `cannot find any reminder with ID ${id}` });
        }

        const { content, isComplete, picture, createdBy, patient } = req.body;
        if (content){
            reminder.content = content
        }
        if (isComplete){ 
            reminder.isComplete = isComplete
        }
        if (picture){
            reminder.picture = picture
        }
        /*
        // have a message saying cannot be updated?
        if (createdBy){
            reminder.picture = picture
        }
        */

        const updatedReminder = await reminder.save();
        res.status(200).json(updatedReminder);
        /*
        console.log(req.body);
        const reminder = await Reminder.findOneAndUpdate(
            { _id: id }, 
            req.body, {
                new: true,
                runValidators: true,
            }
        );
        if (!reminder) {
            return res
            .status(404)
            .json({ message: `cannot find any reminder with ID ${id}` });
        }
        const updatedReminder = await Reminder.findById(id);
        res.status(200).json(updatedReminder);
        */
    } catch (e) {
        if (e.name === "ValidationError") {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(400).json({ validationErrors });
        } else {
            res.status(400).json({ success: false });
        }
    }
}

const deleteReminderById = async (req, res) => {
    try {
        const { id } = req.params;
        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ message: `cannot find any reminder with ID ${id}` });
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
            return res.status(404).json({ message: `cannot find any patient tagged to alert with ID ${id}` });
        }
    
        await Reminder.deleteOne({_id: id});
        res.status(200).json(reminder);
    } catch (e) {
        res.status(400).json({ success: false });
    }
}

module.exports = {
    createReminder,
    getAllReminders,
    getReminderById,
    getRemindersOfPatient,
    updateReminderById,
    deleteReminderById
}