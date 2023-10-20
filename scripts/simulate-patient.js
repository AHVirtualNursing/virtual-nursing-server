const { io } = require("socket.io-client");
const Patient = require("../models/patient");
const { initialiseDb } = require("./initialise-db");
const SERVER_URL = "http://localhost:3001";

const socket = io(SERVER_URL);

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
    [type]: value,
  }));
}

function sendVitals(patientId, type) {
  // hr 60-100bpm
  // rr 16-20
  // bp 120/80
  // spo2 >= 95%
  const vitals = {
    hr: generateVitalData("heartRate", [90, 96, 102, 105]),
    rr: generateVitalData("respRate", [17, 19, 21, 21]),
    spo2: generateVitalData("spO2", [96, 95, 94, 93]),
    bps: generateVitalData("bloodPressureSys", [115, 117, 121, 123]),
    bpd: generateVitalData("bloodPressureDia", [76, 79, 82, 83]),
  };

  let index = 0;
  setInterval(() => {
    if (vitals[type] && index < vitals[type].length) {
      const vital = vitals[type][index];
      vital.patientId = patientId;
      vital.datetime = getCurrentFormattedDatetime();
      socket.emit("watchData", vital);
      index++;
    } else {
      index = 0;
    }
  }, 2000);
}

async function simulatePatient() {
  const arguments = process.argv.slice(2);
  const vitalType = arguments[0];
  let patientId = arguments[1];

  if (vitalType) {
    if (!patientId) {
      patientId = await initialiseDb();
    }
    socket.emit("connectSmartWatch", patientId);
    sendVitals(patientId, vitalType);
  } else {
    console.error("No patient vital argument provided");
    process.exit(1);
  }
}

simulatePatient();

