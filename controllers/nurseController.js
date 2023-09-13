const mongoose = require("mongoose");
const Nurse = require("../models/nurse");

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


module.exports = {
    createNurse
}