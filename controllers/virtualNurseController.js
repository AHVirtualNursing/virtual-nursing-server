const { ObjectId } = require("mongodb");
const Nurse = require("../models/nurse");
const SmartBed = require("../models/smartbed");
const Ward = require("../models/ward");
const { virtualNurse} = require("../models/webUser");

const createVirtualNurse = async (req, res) => {
    try {
      

      const newVirtualNurse = new virtualNurse({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
  
      await newVirtualNurse.save();
      res.status(200).json({ success: true, data: nurse });
    } catch (e) {
      if (e.name === "ValidationError") {
        const validationErrors = Object.values(e.errors).map((e) => e.message);
        return res.status(400).json({ validationErrors });
      } else {
        res.status(500).json({ success: false, error: e.message });
      }
    }
  };