const SmartBed = require("../models/smartbed");
const Nurse = require("../models/nurse");
const Patient = require("../models/patient");
const Ward = require("../models/ward");

const createSmartBed = async(req, res) => {

    try{
        const ward = await Ward.findById({ _id: req.body.ward });
        if(!ward) {
            return res.status(500).json({message: `cannot find any ward with Ward ID ${req.body.ward}`});
        }

        const smartbed = new SmartBed({
            bedNum: req.body.bedNum,
            roomNum: req.body.roomNum,
            ward: req.body.ward
        })
    
        await smartbed.save();

        ward.smartBeds.push(smartbed._id)
        await ward.save();

        res.status(200).json({ success: true, data: smartbed });
    } catch(e){
        if (e.name === "ValidationError") {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(500).json({ validationErrors });
          } else {
            res.status(500).json({ success: false, error: e.message});
          }
    } 
}

const getSmartBeds = async(req, res) => {
    try {
        const smartbeds = await SmartBed.find({}).populate("ward");
        res.status(200).json({ success: true, data: smartbeds });
      } catch (e) {
        res.status(500).json({ success: false, error: e.message});
      }
}

const getSmartBedById = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await SmartBed.findById(id).populate('patient');
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        res.status(200).json(smartbed);
    } catch (e) {
        res.status(500).json({ success: e.message });
    }
}

const getSmartBedsByIds = async(req, res) => {
    const {ids} = req.body;
    
    try {
        const smartBeds = await Promise.all(ids.map(async (id) => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const smartBed = await SmartBed.findById(id).populate("patient ward");
                if (!smartBed) {
                    res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
                }
                return smartBed;
            } else{
                res.status(500).json({ message: `${id} is in wrong format`});
            }}));
        res.status(200).json(smartBeds);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
}

const getNursesBySmartBedId = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await SmartBed.findById(id);
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }

        const nurses = await Nurse.find({smartBeds: {$in: [id]}});
        res.status(200).json(nurses);
    } catch (e) {
        res.status(500).json({ success: e.message });
    }
}

const updateSmartBedById = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await SmartBed.findById(id);
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }

        const {bedStatus, ward, patient, nurses} = req.body;

        if(bedStatus){
            smartbed.bedStatus = bedStatus;
        }
        if(ward){
            const newWard = await Ward.findById(ward).populate('smartBeds');
            if (!newWard) {
                res.status(500).json({ message: `Ward with ID: ${ward}} not found` }); 
            }

            const oldWard = await Ward.findOne({smartBeds: {$in: [id]}}).populate('smartBeds');
            console.log(oldWard)
            if ((oldWard !== null && oldWard !== undefined)) {
                if (Object.keys(oldWard).length !== 0) {
                    console.log("changing oldward tags")
                    oldWard.smartBeds.pull(id); // Remove the nurse's ID from the list of nurses
                    await oldWard.save();
                } 
            }

            newWard.smartBeds.push(id);
            await newWard.save();

            smartbed.ward = ward;
        }
        if(patient){
            const incomingPatient = await Patient.findById(patient);
            if(incomingPatient){
                smartbed.patient = patient
            } else{
                res.status(500).json({ message: `Patient with ID: ${patient} not found` }); 
            }
        }
        await smartbed.save();
        res.status(200).json(smartbed);
    } catch (e) {
        if (e.name === 'ValidationError') {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(500).json({validationErrors});
        } else {
            res.status(500).json({ success: e.message }); 
        }
    }
}

const assignBedToNurses = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await SmartBed.findById(id).populate('nurses'); 
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }

        const { newNurses } = req.body;
        const oldNurses = smartbed.nurses;

        const updatedSmartbed = await SmartBed.findOneAndUpdate(  
            { _id: id },
            { nurses: newNurses },
            {
                new: true,
                runValidators: true,
            }
        );
        
        if (oldNurses !== undefined && oldNurses.length > 0) {
            for (const nurseId of oldNurses) {
                await Nurse.findOneAndUpdate(
                    { _id: nurseId },
                    { $pull: { smartBeds: id } },
                    {
                        new: true,
                        runValidators: true,
                    }
                )
            } 
        }
        
        if (newNurses !== undefined && newNurses.length > 0) {
            for (const nurseId of newNurses) {
                await Nurse.findOneAndUpdate(
                    { _id: nurseId },
                    { $push: { smartBeds: id } },
                    {
                        new: true,
                        runValidators: true,
                    }
                )
            } 
        }
 
        res.status(200).json(updatedSmartbed)
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

const deleteSmartBedById = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await SmartBed.findByIdAndDelete(id);
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        res.status(200).json(smartbed);
    } catch (e) {
        res.status(500).json({ success: e.message }); 
    }
}

module.exports = {
    createSmartBed,
    getSmartBeds,
    getSmartBedById,
    getSmartBedsByIds,
    getNursesBySmartBedId,
    updateSmartBedById,
    assignBedToNurses,
    deleteSmartBedById
}