const SmartBed = require("../models/smartbed");
const Nurse = require("../models/nurse");
const Patient = require("../models/patient");
const Ward = require("../models/ward");

const createSmartBed = async(req, res) => {
    try{
        const smartbed = new SmartBed({
            name: req.body.name
        });
        await smartbed.save();

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
        const {ids} = req.body;
        if (ids) {
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
        } else {
            const smartbeds = await SmartBed.find({}).populate("ward");
            res.status(200).json({ success: true, data: smartbeds });
        }
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

// search model number from unassigned (ward) smartbeds
const updateSmartBedById = async(req, res) => {
    try {
        const {id} = req.params;
        const smartbed = await SmartBed.findById(id);
        if (!smartbed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        
        const { ward, bedNum, roomNum, bedStatus, patient} = req.body;

        if(ward){
            const newWard = await Ward.findById(ward).populate('smartBeds');
            if (!newWard) {
                res.status(500).json({ message: `Ward with ID: ${ward}} not found` }); 
            }

            const oldWard = await Ward.findOne({smartBeds: {$in: [id]}}).populate('smartBeds');
            if ((oldWard !== null && oldWard !== undefined)) {
                if (Object.keys(oldWard).length !== 0) {
                    oldWard.smartBeds.pull(id); 
                    await oldWard.save();
                } 
            }

            newWard.smartBeds.push(id);
            await newWard.save();

            smartbed.ward = ward;
        }
        if(bedNum){
            if (!smartbed.ward) {
                return res.status(500).json({message: `smartbed needs to be assigned to ward`})
            }
            const ward = await Ward.findById(smartbed.ward).populate('smartBeds');
            const smartBeds = ward.smartBeds;
            const bedNums = smartBeds.map(smartBed => smartBed.bedNum);
            if (bedNums.includes(bedNum)) {
                return res.status(500).json({message: `bedNum ${bedNum} has already been assigned to another smartbed in the ward`})
            }
            smartbed.bedNum = bedNum;
        }
        if(roomNum){
            if (!smartbed.ward) {
                return res.status(500).json({message: `smartbed needs to be assigned to ward`})
            }
            const ward = await Ward.findById(smartbed.ward).populate('smartBeds');
            const smartBeds = ward.smartBeds;
            const wardType = ward.wardType;
            const numRooms = ward.numRooms;
            
            // check if there are alr max rooms in the ward
            const roomNums = smartBeds.map(smartBed => smartBed.roomNum);
            if (!roomNums.includes(roomNum)) {
                const uniqueRoomNums = new Set(roomNums);
                console.log('unique roomNums existing: ' + uniqueRoomNums);
                const totalRooms = [...uniqueRoomNums].length;
                if ((totalRooms + 1) > numRooms) {
                    return res.status(500).json({message: `this ward has already reached its max number of rooms`})
                }
            }

            // check if there are alr max beds in the ward
            const sameRoom = roomNums.filter(item => item === roomNum);
            const count = sameRoom.length;
            if (
                (wardType == 'A1' && count >= 1) || 
                (wardType == 'B1' && count >= 4) || 
                (wardType == 'B2' && count >= 5) || 
                (wardType == 'C' && count >= 5)
            ) {
                return res.status(500).json({message: `room with roomNum ${roomNum} has already reached its max number of beds`}) 
            }

            smartbed.roomNum = roomNum;
        }
        if(bedStatus){
            smartbed.bedStatus = bedStatus;
        }

        // dont call this unless testing
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

const assignNursesToBed = async(req, res) => {
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

// dont allow deletion if its tagged to patient, send error msg saying theres a patient
const deleteSmartBedById = async(req, res) => {
    try {
        const {id} = req.params;
        const smartBed = await SmartBed.findById(id);
        if (!smartBed) {
            return res.status(500).json({message: `cannot find any smartbed with ID ${id}`})
        }
        if (smartBed.patient) {
            return res.status(500).json({message: `smartbed with ID ${id} has a patient and cannot be deleted`})
        }

        const ward = await Ward.findOne({smartBeds: {$in: [id]}}).populate('smartBeds');
        if ((ward !== null && ward !== undefined)) {
            if (Object.keys(ward).length !== 0) {
                ward.smartBeds.pull(id);
                await ward.save();
            } 
        }
        for (const nurseId of smartBed.nurses) {
            const nurse = await Nurse.findById(nurseId);
            if (nurse) {
              nurse.smartBeds.pull(id); // Remove the nurse's ID from the list of nurses
              await nurse.save();
            }
        }
        await SmartBed.deleteOne({ _id: id });
        res.status(200).json(smartBed);
    } catch (e) {
        res.status(500).json({ success: e.message }); 
    }
}

module.exports = {
    createSmartBed,
    getSmartBeds,
    getSmartBedById,
    getNursesBySmartBedId,
    updateSmartBedById,
    assignNursesToBed,
    deleteSmartBedById
}