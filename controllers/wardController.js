const Ward = require("../models/ward");
const SmartBed = require("../models/smartbed");
const Nurse = require("../models/nurse");

const createWard = async (req, res) => {
  try {
    const ward = new Ward({
      wardNum: req.body.wardNum,
      wardType: req.body.wardType,
      numRooms: req.body.numRooms,
    });
    await Ward.create(ward);
    res.status(200).json({ success: true, data: ward });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const getWards = async (req, res) => {
  try {
    const wards = await Ward.find({});
    res.status(200).json({ success: true, data: wards });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getWardById = async(req, res) => {
    try {
        const {id} = req.params;
        const ward = await Ward.findById(id)
        if (!ward) {
            return res.status(500).json({message: `cannot find any ward with ID ${id}`})
        }
        res.status(200).json(ward);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}

const getSmartBedsByWardId = async(req, res) => {
    try {
        const {id} = req.params;
        const ward = await Ward.findById(id);
        if (!ward) {
            return res.status(500).json({message: `cannot find any ward with ID ${id}`})
        }

        const idsToRetrieve = ward.smartBeds.map(id => id.toString());
    
        const smartBeds = await Promise.all(idsToRetrieve.map(async (id) => {
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const smartBed = await Smartbed.findById(id).populate('patient');
                if (!smartBed) {
                    res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
                }
                return smartBed;
            } else{
                res.status(500).json({ message: `${id} is in wrong format`});
            }}));
        res.status(200).json(smartBeds);
    } catch (e) {
        res.status(500).json({ success: e.message });
    }
}


// use this for assignment of smartbeds to ward
const updateWardById = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const { wardNum, wardType, numRooms, smartBeds } = req.body;

    if (wardNum) {
      ward.wardNum = wardNum;
    }
    if (wardType) {
      ward.wardType = wardType;
    }
    if (numRooms) {
      ward.numRooms = numRooms;
    }
    if (smartBeds) {
      for (const smartBedId of smartBeds) {
        const smartBed = await SmartBed.findById(smartBedId);
        if (!smartBed) {
          res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        smartBed.ward = id;
        await smartBed.save();
      }
      ward.smartBeds = smartBeds;      
    }


    const updatedWard = await ward.save();
    res.status(200).json(updatedWard);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const assignNurseToWard = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const nurseId = req.body.nurse;
    const nurse = await Nurse.findById(nurseId).populate("ward");
    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${nurseId}` });
    }

    ward.nurses.push(nurseId);
    await ward.save();

    const oldWard = nurse.ward;

    await Ward.findOneAndUpdate(
      { _id: oldWard },
      { $pull: { nurses: nurseId } },
      {
        new: true,
        runValidators: true,
      }
    );

    await Nurse.findOneAndUpdate(
      { _id: nurseId },
      { ward: id },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(ward);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteWardById = async (req, res) => {
  try {
    const { id } = req.params;
    const ward = await Ward.findById(id);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find any ward with ID ${id}` });
    }

    const { smartBeds, nurses } = ward;

    if (smartBeds.length > 0 || nurses.length > 0) {
      return res.status(500).json({
        message: `Wards containing smartbeds or with nurses working in it cannot be deleted`,
      });
    }

    await Ward.deleteOne({ _id: id });
    res.status(200).json(ward);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
    createWard,
    getWards,
    getWardById,
    getSmartBedsByWardId,
    updateWardById,
    assignNurseToWard,
    deleteWardById
}