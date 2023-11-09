const { io } = require("socket.io-client");
const { initialiseDb } = require("./initialiseDb");
const { sendMockPatientVitals } = require("./sendMockPatientVitals");
const mongoose = require("mongoose");
const Patient = require("../models/patient");
const patientController = require("../controllers/patientController");

const SERVER_URL = "http://localhost:3001";

async function simulatePatientVitals() {
  const socket = io(SERVER_URL);
  const arguments = process.argv.slice(2);
  const vitalType = arguments[0];
  let patientId = arguments[1];

  function getCurrentFormattedDatetime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function generateVitalData(type, values) {
    return values.map((value) => ({
      patientId: patientId,
      [type]: value,
    }));
  }

  function sendVitals(vitalType) {
    /* THRESHOLDS */
    // hr: 60-100bpm, rr: 16-20, bp: 90-120/60-80, spo2 >= 95%, temperature: 36.2 - 37.2, respiratoryRate: 12-18 bpm
    const vitals = {
      hr: generateVitalData(
        "heartRate",
        [66, 76, 85, 90, 102, 115, 100, 95, 70, 55]
      ),
      spo2: generateVitalData("spO2", [96, 95, 97, 97, 96, 95, 93, 95, 96, 95]),
      bps: generateVitalData(
        "bloodPressureSys",
        [90, 100, 114, 120, 126, 120, 110, 89, 75, 73]
      ),
      bpd: generateVitalData(
        "bloodPressureDia",
        [76, 79, 82, 86, 90, 80, 74, 60, 54, 57]
      ),
      temp: generateVitalData(
        "temperature",
        [36.2, 36.5, 36.7, 37.0, 37.2, 37.5, 38.2, 37.3, 36.2, 35.9]
      ),
      rr: generateVitalData(
        "respRate",
        [12, 16, 18, 19, 20, 18, 15, 12, 10, 11]
      ),
    };

    let index = 0;
    setInterval(() => {
      if (
        vitalType === "bp" &&
        (index < vitals["bps"].length || index < vitals["bpd"].length)
      ) {
        const bpsVital = vitals["bps"][index];
        const bpdVital = vitals["bpd"][index];
        bpsVital.datetime = getCurrentFormattedDatetime();
        bpdVital.datetime = getCurrentFormattedDatetime();
        socket.emit("watchData", bpsVital);
        socket.emit("watchData", bpdVital);
        index++;
      } else if (vitals[vitalType] && index < vitals[vitalType].length) {
        const vital = vitals[vitalType][index];
        vital.datetime = getCurrentFormattedDatetime();
        socket.emit("watchData", vital);
        index++;
      } else {
        index = 0;
      }
    }, 2000);
  }

  async function simulateFallRisk() {
    mongoose.connect(process.env.MONGODB_LOCAL_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
    });
    const fallRiskValues = ["Low", "Medium", "High"];
    let index = 0;

    const updateFallRisk = async () => {
      if (index >= fallRiskValues.length) {
        index = 0;
      }

      const fallRiskValue = fallRiskValues[index];
      const patient = await Patient.findById(patientId);

      const req = { params: { id: patientId } };
      const res = {
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

      await patientController.getVirtualNurseByPatientId(req, res);
      const virtualNurseId = res.jsonData._id;
      patient.fallRisk = fallRiskValue;
      await patient.save();

      if (patient && virtualNurseId)
        socket.emit("fallRiskUpdate", [patient, virtualNurseId]);

      console.log(`Updated patient fall risk to ${fallRiskValue}`);
      index++;

      setTimeout(updateFallRisk, 10000);
    };

    updateFallRisk();
  }

  if (vitalType) {
    if (vitalType === "s3") {
      sendMockPatientVitals(patientId);
    } else {
      if (!patientId) {
        patientId = await initialiseDb();
      }
      socket.emit("connectSmartWatch", patientId);
      if (vitalType == "all") {
        sendVitals("hr");
        setTimeout(() => {
          sendVitals("spo2");
        }, 100);
        setTimeout(() => {
          sendVitals("bp");
        }, 200);
        setTimeout(() => {
          sendVitals("temp");
        }, 300);
        setTimeout(() => {
          sendVitals("rr");
        }, 400);
      } else if (vitalType == "fr") {
        simulateFallRisk();
      } else {
        sendVitals(vitalType);
      }
    }
  } else {
    console.error("No patient vital argument provided");
    process.exit(1);
  }
}

simulatePatientVitals();
