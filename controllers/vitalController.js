const Vital = require("../models/vital");
const Patient = require("../models/patient");

const addVitalForPatient = async (req, res) => {
  try {
    const {
      patient,
      datetime,
      respRate,
      heartRate,
      bloodPressureSys,
      bloodPressureDia,
      spO2,
      temperature,
    } = req.body;

    const vitalsData = {
      datetime,
      respRate,
      heartRate,
      bloodPressureSys,
      bloodPressureDia,
      spO2,
      temperature,
    };

    const vital = await processVitalForPatient(patient, vitalsData);

    res.status(200).json({ success: true, data: vital });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

const processVitalForPatient = async (patientId, vitalsData) => {
  try {
    const patient = await Patient.findById(patientId).populate("vital");
    if (!patient) {
      throw new Error(`Cannot find any patient with Patient ID ${patientId}`);
    }

    let vital = patient.vital;
    if (!vital) {
      vital = new Vital({
        respRate: [],
        heartRate: [],
        bloodPressureSys: [],
        bloodPressureDia: [],
        sp02: [],
        temperature: [],
      });
      await vital.save();
      patient.vital = vital;
      await patient.save();
    }

    const vitalsReading = {
      datetime: vitalsData.datetime,
    };

    if (vitalsData.respRate) {
      vitalsReading.reading = vitalsData.respRate;
      vital.respRate.push(vitalsReading);
    }
    if (vitalsData.heartRate) {
      vitalsReading.reading = vitalsData.heartRate;
      vital.heartRate.push(vitalsReading);
    }
    if (vitalsData.bloodPressureSys) {
      vitalsReading.reading = vitalsData.bloodPressureSys;
      vital.bloodPressureSys.push(vitalsReading);
    }
    if (vitalsData.bloodPressureDia) {
      vitalsReading.reading = vitalsData.bloodPressureDia;
      vital.bloodPressureDia.push(vitalsReading);
    }
    if (vitalsData.spO2) {
      vitalsReading.reading = vitalsData.spO2;
      vital.spO2.push(vitalsReading);
    }
    if (vitalsData.temperature) {
      vitalsReading.reading = vitalsData.temperature;
      vital.temperature.push(vitalsReading);
    }
    if (vitalsData.respRate) {
      vitalsReading.reading = vitalsData.respRate;
      vital.respRate.push(vitalsReading);
    }

    await vital.save();
    patient.vital = vital;
    await patient.save();

    return vital;
  } catch (error) {
    throw error;
  }
};

const getVitals = async (req, res) => {
  try {
    if (req.query.ids) {
      const ids = req.query.ids.split(",");
      const vitals = await Promise.all(
        ids.map(async (id) => {
          if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const vital = await Vital.findById(id);
            console.log(vital);
            if (!vital) {
              res
                .status(500)
                .json({ message: `cannot find any vital with ID ${id}` });
            }
            return vital;
          } else {
            res.status(500).json({ message: `${id} is in wrong format` });
          }
        })
      );
      res.status(200).json(vitals);
    } else {
      const vitals = await Vital.find({});
      res.status(200).json({ success: true, data: vitals });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: e.message });
  }
};

const getVitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const vital = await Vital.findById(id);
    if (!vital) {
      return res
        .status(500)
        .json({ message: `cannot find any vital with ID ${id}` }); //status 400?
    }
    res.status(200).json(vital);
  } catch (e) {
    res.status(500).json({ success: e.message });
  }
};

module.exports = {
  addVitalForPatient,
  processVitalForPatient,
  getVitals,
  getVitalById,
};
