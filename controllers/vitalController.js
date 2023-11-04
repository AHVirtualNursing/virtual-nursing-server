const Vital = require("../models/vital");
const Patient = require("../models/patient");
const AlertController = require("../controllers/alertController");
const AlertConfig = require("../models/alertConfig");


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
    const patient = await Patient.findById(patientId)
      .populate("vital")
      .populate("alertConfig");

    if (!patient) {
      return res.status(500).json({
        message: `cannot find any patient with Patient ID ${req.body.patient}`,
      });
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

    let alertConfig = patient.alertConfig;

    if (!alertConfig) {
      throw new Error(
        `cannot find any Alert Config with Patient ID ${patientId}`
      );
    }

    const request = {
      body: {
        patient: patientId,
        description: "",
        notes: "Any additional notes",
        sentBy: "Sender name or ID",
      },
    };

    const result = {
      statusCode: null,
      jsonData: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.jsonData = data;
        return this;
      },
    };

    const vitalsReading = {
      datetime: vitalsData.datetime,
    };

    if (vitalsData.respRate) {
      vitalsReading.reading = vitalsData.respRate;
      vital.respRate.push(vitalsReading);

      if (
        vitalsData.respRate < alertConfig.rrConfig[0] ||
        vitalsData.respRate > alertConfig.rrConfig[1]
      ) {
        if (vitalsData.respRate < alertConfig.rrConfig[0]) {
          request.body.description =
            request.body.description +
            "Respiratory rate has fallen below threshold" +
            "\n";
        } else {
          request.body.description =
            request.body.description +
            "Respiratory rate has risen above threshold" +
            "\n";
        }
      }
    }

    if (vitalsData.heartRate) {
      vitalsReading.reading = vitalsData.heartRate;
      vital.heartRate.push(vitalsReading);

      if (
        vitalsData.heartRate < alertConfig.hrConfig[0] ||
        vitalsData.heartRate > alertConfig.hrConfig[1]
      ) {
        if (vitalsData.heartRate < alertConfig.hrConfig[0]) {
          request.body.description =
            request.body.description +
            "Heart rate has fallen below threshold" +
            "\n";
        } else {
          request.body.description =
            request.body.description +
            "Heart rate has risen above threshold" +
            "\n";
        }
      }
    }

    if (vitalsData.bloodPressureSys) {
      vitalsReading.reading = vitalsData.bloodPressureSys;
      vital.bloodPressureSys.push(vitalsReading);

      if (
        vitalsData.bloodPressureSys < alertConfig.bpSysConfig[0] ||
        vitalsData.bloodPressureSys > alertConfig.bpSysConfig[1]
      ) {
        if (vitalsData.bloodPressureSys < alertConfig.bpSysConfig[0]) {
          request.body.description =
            request.body.description +
            "Systolic Blood Pressure has fallen below threshold" +
            "\n";
        } else {
          request.body.description =
            request.body.description +
            "Systolic Blood Pressure has risen above threshold" +
            "\n";
        }
      }
    }

    if (vitalsData.bloodPressureDia) {
      vitalsReading.reading = vitalsData.bloodPressureDia;
      vital.bloodPressureDia.push(vitalsReading);

      if (
        vitalsData.bloodPressureDia < alertConfig.bpDiaConfig[0] ||
        vitalsData.bloodPressureDia > alertConfig.bpDiaConfig[1]
      ) {
        if (vitalsData.bloodPressureDia < alertConfig.bpDiaConfig[0]) {
          request.body.description =
            request.body.description +
            "Diastolic Blood Pressure has fallen below threshold" +
            "\n";
        } else {
          request.body.description =
            request.body.description +
            "Diastolic Blood Pressure has risen above threshold" +
            "\n";
        }
      }
    }

    if (vitalsData.spO2) {
      vitalsReading.reading = vitalsData.spO2;
      vital.spO2.push(vitalsReading);

      if (
        vitalsData.sp02 < alertConfig.spO2Config[0] ||
        vitalsData.sp02 > alertConfig.spO2Config[1]
      ) {
        if (vitalsData.spO2 < alertConfig.spO2Config[0]) {
          request.body.description =
            request.body.description +
            "Oxygen Level has fallen below threshold" +
            "\n";
        } else {
          request.body.description =
            request.body.description +
            "Oxygen Level has risen above threshold" +
            "\n";
        }
      }
    }

    if (vitalsData.temperature) {
      vitalsReading.reading = vitalsData.temperature;
      vital.temperature.push(vitalsReading);
    }

    await vital.save();
    patient.vital = vital;
    await patient.save();

    if (request.body.description != "") {
      await AlertController.createAlert(request, result);
    }

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
