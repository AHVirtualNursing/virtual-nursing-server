const Vital = require("../models/vital");
const Patient = require("../models/patient");

const addVitalForPatient = async (req, res) => {
  try {
    const patient = await Patient.findById({ _id: req.body.patient }).populate(
      "vital"
    );
    if (!patient) {
      return res.status(500).json({
        message: `cannot find any patient with Patient ID ${req.body.patient}`,
      });
    }

    const vital = patient.vital;
    console.log(vital);
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
    console.log(vital);

    const {
      datetime,
      respRate,
      heartRate,
      bloodPressureSys,
      bloodPressureDia,
      spO2,
      temperature,
    } = req.body;
    console.log(datetime);
    const vitalsReading = {
      datetime: datetime,
    }

    if (respRate) {
      vitalsReading.reading = respRate;
      console.log(vital.respRate);
      vital.respRate.push(vitalsReading);
    }
    if (heartRate) {
      vitalsReading.reading = heartRate;
      vital.heartRate.push(vitalsReading);
    }
    if (bloodPressureSys) {
      vitalsReading.reading = bloodPressureSys;
      vital.bloodPressureSys.push(vitalsReading);
    }
    if (bloodPressureDia) {
      vitalsReading.reading = bloodPressureDia;
      vital.bloodPressureDia.push(vitalsReading);
    }
    if (spO2) {
      vitalsReading.reading = spO2;
      vital.spO2.push(vitalsReading);
    }
    if (temperature) {
      vitalsReading.temperature = temperature;
      vital.temperature.push(vitalsReading);
    }

    await vital.save();

    patient.vital = vital;
    await patient.save();

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
  getVitals,
  getVitalById,
};
