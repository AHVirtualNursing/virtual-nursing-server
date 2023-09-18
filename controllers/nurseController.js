const { ObjectId } = require("mongodb");
const Nurse = require("../models/nurse");
const SmartBed = require("../models/smartbed");
const Ward = require("../models/ward")
const nurseStatusEnum = ["normal", "head"];

const createNurse = async(req, res) => {
    try{
       const nurse = new Nurse({
            name: req.body.name,
            nurseStatus: req.body.nurseStatus,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        const result = await nurse.save();
        res.status(200).json({ success: true, data: nurse });
    }catch(e){
        if (e.name === "ValidationError") {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(400).json({ validationErrors });
          } else {
            res.status(500).json({ success: false, error: e.message});
          }
    }
}

const getNurses = async(req, res) => {
    try {
        const nurses = await Nurse.find({});
        res.status(200).json({ success: true, data: nurses });
      } catch (e) {
        res.status(500).json({ success: false, error: e.message});
      }
}

const getNurseById = async(req, res) => {
    try {
        const { id } = req.params;
        const nurse = await Nurse.findById(id);
        if (!nurse) {
          return res.status(500).json({ message: `cannot find any nurse with ID ${id}` });
        }
        res.status(200).json(nurse);
      } catch (e) {
        console.log(e);
        res.status(400).json({ success: false });
      }
}

const getSmartBedsByNurseId = async(req, res) => {
    try{
        const { id } = req.params;
        const nurse = await Nurse.findById(id)

        if (!nurse) {
            return res.status(500).json({ message: `cannot find any nurse with ID ${id}`});
        }
        const smartBeds = await SmartBed.find({nurses: {$in: [id]}});
        console.log(smartBeds);
        res.status(200).json(smartBeds);
    } catch (e) {
        res.status(400).json({ success: e.message});
      }
}

//change to remove the updates of linking  
const updateNurseById = async(req, res) => {
    try {
        const { id } = req.params;
        const nurse = await Nurse.findById(id);

        if (!nurse) {
          return res.status(500).json({ message: `cannot find any nurse with ID ${id}` });
        }

        const { ward, smartBeds, headNurse } = req.body;

        if (ward){
          nurse.ward = ward
        }
        if (smartBeds){
          nurse.smartBeds = smartBeds
        }
        if (headNurse){
          nurse.headNurse = headNurse
        } 

        const updatedNurse = await nurse.save()
        res.status(200).json(updatedNurse);

      } catch (e) {
        if (e.name === "ValidationError") {
          const validationErrors = Object.values(e.errors).map((e) => e.message);
          res.status(400).json({ validationErrors });
        } else {
          res.status(500).json({ success: false, error: e.message});
        }
      }
}

const deleteNurseById = async(req, res) => {
    try {
        const { id } = req.params;
        const nurse = await Nurse.findById(id);
        if (!nurse) {
          return res.status(500).json({ message: `cannot find any nurse with ID ${id}` });
        }

        const { smartBeds, ward} = nurse;

        for (const smartBedId of smartBeds) {
          const smartBed = await SmartBed.findById(smartBedId).populate('nurses');
          if (smartBed) {
            smartBed.nurses.pull(id); // Remove the nurse's ID from the list of nurses
            await smartBed.save();
          }  
        }    

        const newWard = await Ward.findById(ward).populate('nurses');
        if (newWard) {
          newWard.nurses.pull(id); // Remove the nurse's ID from the list of nurses
          await newWard.save();
        }


        await Nurse.findByIdAndDelete(id);

        res.status(200).json(nurse);
      } catch (e) {
        res.status(500).json({ success: false, error: e.message});
      }
}

module.exports = {
    createNurse,
    getNurses,
    getNurseById,
    getSmartBedsByNurseId,
    updateNurseById,
    deleteNurseById
}