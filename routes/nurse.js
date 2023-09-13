const express = require("express");
const router = express.Router();
const Nurse = require("../models/nurse");
const nurse = require("../controllers/nurseController");
router.get("/", async (req, res) => {
  try {
    const nurses = await Nurse.find({});
    res.status(200).json({ success: true, data: nurses });
  } catch (e) {
    res.status(400).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
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
        .status(404)
        .json({ message: `cannot find any nurse with ID ${id}` });
    }
    res.status(200).json(nurse);
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
});

router.get("/getNursesOfBed/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const nurses = await Nurse.find({ smartBeds: { $in: [id] } });
    if (!nurses) {
      return res
        .status(404)
        .json({ message: `cannot find any bed with ID ${id}` });
    }
    res.status(200).json(nurses);
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
});

router.post("/",  nurse.createNurse);

// router.post("/",  async (req, res) => {
//   try {
//     const newNurse = await Nurse.create(req.body);
//     res.status(200).json({ success: true, data: newNurse });
//   } catch (e) {
//     if (e.name === "ValidationError") {
//       const validationErrors = Object.values(e.errors).map((e) => e.message);
//       return res.status(400).json({ validationErrors });
//     } else {
//       res.status(400).json({ success: false });
//     }
//   }
// });

router.put("/:id", async (req, res) => {
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
      return res.status(400).json({ validationErrors });
    } else {
      res.status(400).json({ success: false });
    }
  }
});

router.delete("/:id", async (req, res) => {
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
    res.status(400).json({ success: false });
  }
});

module.exports = router;
