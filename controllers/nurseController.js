const Nurse = require("../models/nurse");
const SmartBed = require("../models/smartbed");
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
        res.status(result.status).json({ success: true, data: nurse });
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
          return res.status(404).json({ message: `cannot find any nurse with ID ${id}` });
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
            return res.status(404).json({ message: `cannot find any nurse with ID ${id}`});
        }
        const smartBeds = await SmartBed.find({nurses: {$in: [id]}}).populate('patient');
        console.log(smartBeds);
        res.status(200).json(smartBeds);
    } catch (e) {
        res.status(400).json({ success: e.message});
      }
}

const updateNurseById = async(req, res) => {
    try {
        const { id } = req.params;
        const nurse = await Nurse.findOneAndUpdate({ _id: id }, req.body, {
          new: true,
          runValidators: true,
        });
        if (!nurse) {
          return res
            .status(404)
            .json({ message: `cannot find any nurse with ID ${id}` });
        }
        const updatedNurse = await Nurse.findById(id);
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
        const nurse = await Nurse.findByIdAndDelete(id);
        if (!nurse) {
          return res
            .status(404)
            .json({ message: `cannot find any nurse with ID ${id}` });
        }
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