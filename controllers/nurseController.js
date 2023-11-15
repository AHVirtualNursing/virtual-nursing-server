const { ObjectId } = require("mongodb");
const { Nurse }= require("../models/nurse");
const { SmartBed } = require("../models/smartbed");
const Ward = require("../models/ward");

const createNurse = async (req, res, session) => {
  try {
    const wardId = req.body.ward;
    const ward = Ward.findById(wardId);
    if (!ward) {
      return res
        .status(500)
        .json({ message: `cannot find assigned ward with ID ${wardId}` });
    }

    const nurse = new Nurse({
      name: req.body.name,
      nurseStatus: req.body.nurseStatus,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      ward: req.body.ward,
    });

    await Ward.findOneAndUpdate(
      { _id: wardId },
      { $push: { nurses: nurse._id } },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    return nurse;
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(500).json({ success: false, error: e.message });
    }
  }
};

const getNurses = async (req, res) => {
  try {
    if (req.query.ids) {
      const ids = req.query.ids.split(",");
      const nurses = await Promise.all(
        ids.map(async (id) => {
          if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const nurse = await Nurse.findById(id);
            if (!nurse) {
              return res
                .status(500)
                .json({ message: `cannot find any nurse with ID ${id}` });
            }
            return nurse;
          } else {
            return res.status(500).json({ message: `${id} is in wrong format` });
          }
        })
      );
      res.status(200).json(nurses);
    } else {
      const nurses = await Nurse.find({});
      res.status(200).json({ success: true, data: nurses });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getNurseById = async (req, res) => {
  try {
    const { id } = req.params;
    const nurse = await Nurse.findById(id).populate([
      {
        path: "smartBeds",
        populate: [
          {
            path: "patient",
            populate: [
              {
                path: "reminders",
                populate: [{ path: "patient" }],
              },
              {
                path: "alerts",
                populate: [{ path: "patient" }],
              },
              {
                path: "alertConfig",
              },
            ],
          },
          { path: "ward" },
        ],
      },
      { path: "headNurse" },
      { path: "ward" },
    ]);

    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${id}` });
    }
    res.status(200).json(nurse);
  } catch (e) {
    res.status(400).json({ success: false });
  }
};

const getSmartBedsByNurseId = async (req, res) => {
  try {
    const { id } = req.params;
    const nurse = await Nurse.findById(id);

    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${id}` });
    }
    const smartBeds = await SmartBed.find({ nurses: { $in: [id] } }).populate([
      { path: "ward" },
      { path: "patient" },
    ]);
    res.status(200).json(smartBeds);
  } catch (e) {
    res.status(400).json({ success: e.message });
  }
};

const updateNurseById = async (req, res) => {
  try {
    const { id } = req.params;
    const nurse = await Nurse.findById(id);

    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${id}` });
    }

    const {
      name,
      username,
      smartBeds,
      headNurse,
      nurseStatus,
      mobilePushNotificationToken,
      picture,
    } = req.body;

    if (name) {
      nurse.name = name;
    }
    if (username) {
      nurse.username = username;
    }
    if (smartBeds) {
      nurse.smartBeds = smartBeds;
    }
    if (headNurse !== undefined) {
      nurse.headNurse = headNurse;
    }
    if (nurseStatus) {
      nurse.nurseStatus = nurseStatus;
    }
    if (mobilePushNotificationToken) {
      nurse.mobilePushNotificationToken = mobilePushNotificationToken;
    }
    if (picture) {
      nurse.picture = picture;
    }

    const updatedNurse = await nurse.save();
    res.status(200).json(updatedNurse);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(400).json({ validationErrors });
    } else {
      res.status(500).json({ success: false, error: e.message });
    }
  }
};

const deleteNurseById = async (req, res) => {
  try {
    const { id } = req.params;
    const nurse = await Nurse.findById(id);
    if (!nurse) {
      return res
        .status(500)
        .json({ message: `cannot find any nurse with ID ${id}` });
    }

    const { smartBeds, ward } = nurse;

    for (const smartBedId of smartBeds) {
      const smartBed = await SmartBed.findById(smartBedId).populate("nurses");
      if (smartBed) {
        smartBed.nurses.pull(id); // Remove the nurse's ID from the list of nurses
        await smartBed.save();
      }
    }

    const newWard = await Ward.findById(ward).populate("nurses");
    if (newWard) {
      newWard.nurses.pull(id); // Remove the nurse's ID from the list of nurses
      await newWard.save();
    }

    await Nurse.findByIdAndDelete(id);

    res.status(200).json(nurse);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const getNursesByHeadNurseId = async (req, res) => {
  try {
    const { id } = req.params;
    const nurses = await Nurse.find({ headNurse: id }).populate([
      { path: "smartBeds" },
      { path: "headNurse" },
      { path: "ward" },
    ]);
    if (!nurses) {
      return res
        .status(404)
        .json({ message: `cannot find any headNurse with ID ${id}` });
    }
    res.status(200).json(nurses);
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

module.exports = {
  createNurse,
  getNurses,
  getNurseById,
  getSmartBedsByNurseId,
  getNursesByHeadNurseId,
  updateNurseById,
  deleteNurseById,
};
