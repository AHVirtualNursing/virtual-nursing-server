const express = require("express");
const router = express.Router();
const Nurse = require("../models/nurse");
const nurse = require("../controllers/nurseController");

router.get("/", nurse.getNurses);

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
              {
                path: "alerts",
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
router.get("/:id/smartbeds", nurse.getSmartBedsByNurseId);
router.post("/",  nurse.createNurse);
router.put("/:id", nurse.updateNurseById);
router.delete("/:id", nurse.deleteNurseById);

module.exports = router;
