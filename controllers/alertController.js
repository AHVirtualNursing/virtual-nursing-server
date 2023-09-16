const mongoose = require("mongoose");
const Alert = require('../models/alert');
const Patient = require('../models/patient');

const createAlert = async (req, res) => {
    try {
        const patient = await Patient.findById({ _id: req.body.patient });
        if(!patient) {
            return res.status(500).json({message: `cannot find any patient with Patient ID ${req.body.patient}`});
        }
        const alert = new Alert({
            description: req.body.description,
            notes: req.body.notes,
            patient: req.body.patient  //verify if patient exists first
        })
        await alert.save();

        patient.alerts.push(alert._id)
        await patient.save();

        res.status(200).json({ success: true, data: alert });
    } catch (e) {
        if (e.name === 'ValidationError') {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            res.status(400).json({validationErrors});
        } else {
            res.status(400).json({ success: false }); 
        }
    }
};

const getAllAlerts = async (req, res) => {
    try {
      const alerts = await Alert.find({});
      res.status(200).json({ success: true, data: alerts });
    } catch (e) {
      res.status(400).json({ success: false });
    }
};

const getAlertById = async(req, res) => {
    try {
        const {id} = req.params;
        const alert = await Alert.findById(id);
        if (!alert) {
            res.status(404).json({message: `cannot find any alert with ID ${id}`})
        }
        res.status(200).json(alert);
    } catch (e) {
        res.status(400).json({ success: false });
    }
};

const updateAlertById = async(req, res) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findById(id);
        if (!alert) {
            return res.status(404).json({ message: `cannot find any alert with ID ${id}` });
        }

        const { status, description, notes } = req.body;
        if (status){
            alert.status = status
        }
        if (description){ 
            alert.description = description
        }
        if (notes){
            alert.notes = notes
        }
        /* // shouldnt be able to tho right?
        if (patient){    
            const patientObj = await Patient.findById({ _id: patient });
            if(!patientObj) {
              return res.status(400).json({message: `cannot find any patient with ID ${patient}`});
            }
            alert.patient = patient
            // tag patient to this alert


        }
        */
        const updatedAlert = await alert.save();
        res.status(200).json(updatedAlert);
      } catch (e) {
        if (e.name === "ValidationError") {
          const validationErrors = Object.values(e.errors).map((e) => e.message);
          return res.status(500).json({ validationErrors });
        } else {
          res.status(500).json({ message: e.message });
        }
    }
}
/*
        const {id} = req.params;
        
        if (req.body.patient) {
            const patient = await Patient.findById({ _id: req.body.patient });
            if(!patient) {
                return res.status(500).json({message: `cannot find any patient with Patient ID ${req.body.patient}`});
            } 
        }        
        
        const alert = await Alert.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!alert) {
            return res.status(404).json({message: `cannot find any alert with ID ${id}`})
        }
        const updatedAlert = await Alert.findById(id);
        res.status(200).json(updatedAlert);
        */


const deleteAlertById = async(req, res) => {
    try {
        /*
        const {id} = req.params;

        const alert = await Alert.findById(id);
        if (!alert) {
            res.status(404).json({message: `cannot find any alert with ID ${id}`})
        }

        const { patient } = alert;
        const patientToDelete = await Patient.findById(patient).populate('alerts');
        if (!patientToDelete) {
            res.status(404).json({message: `cannot find patient tagged to this alert with ID ${patient}`})           
        } 
        patientToDelete.alerts.pull(id);
        await patientToDelete.save();   

        await Alert.deleteOne({_id: id});
        res.status(200).json(alert);
        */

        const { id } = req.params;
        const alert = await Alert.findById(id);
        if (!updatedPatient) {
            return res.status(404).json({ message: `cannot find any patient tagged to this alert with ID ${id}` });
        }

        //Remove link from Patient to Alert
        const updatedPatient = await Patient.findOneAndUpdate(
            { _id: alert.patient },
            { $pull: { alerts: id } },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!alert) {
        return res.status(404).json({ message: `cannot find any alert with ID ${id}` });
        }
        await Alert.deleteOne({_id: id});
        res.status(200).json(alert);
    } catch (e) {
        res.status(400).json({ error: e.message }); 
    }
}


module.exports = {
    createAlert,
    getAllAlerts,
    getAlertById,
    updateAlertById,
    deleteAlertById
}