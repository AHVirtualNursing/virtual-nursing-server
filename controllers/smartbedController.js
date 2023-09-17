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
        const smartbeds = await SmartBed.find({});
        res.status(200).json({ success: true, data: smartbeds });
      } catch (e) {
        res.status(500).json({ success: false, error: e.message});
      }
}

const getSmartBedById = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await Smartbed.findById(id).populate('patient');
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        res.status(200).json(smartbed);
    } catch (e) {
        res.status(500).json({ success: e.message });
    }
}

const getSmartBedsByIds = async(req, res) => {
    const idsToRetrieve = req.query.ids.split(',');
    
    try {
        const smartBeds = await Promise.all(idsToRetrieve.map(async (id) => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const smartBed = await Smartbed.findById(id).populate("patient ward");
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
            return res.status(404).json({message: `cannot find any smartbed with ID ${id}`})
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
        const smartbed = await SmartBed.findOneAndUpdate(
            {_id: id},
            req.body,
            {new: true, runValidators: true}
        );
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        const updatedSmartbed = await SmartBed.findById(id);
        res.status(200).json(updatedSmartbed);
    } catch (e) {
        if (e.name === 'ValidationError') {
            const validationErrors = Object.values(e.errors).map((e) => e.message);
            return res.status(500).json({validationErrors});
        } else {
            res.status(500).json({ success: e.message }); 
        }
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
    deleteSmartBedById
}