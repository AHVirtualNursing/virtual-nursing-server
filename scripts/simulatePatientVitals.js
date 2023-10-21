const { io } = require("socket.io-client");
const { initialiseDb } = require("./initialiseDb");
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
      datetime: getCurrentFormattedDatetime(),
    }));
  }

  function sendVitals() {
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
      if (
        vitalType === "bp" &&
        (index < vitals["bps"].length || index < vitals["bpd"].length)
      ) {
        const bps = vitals["bps"][index];
        const bpd = vitals["bpd"][index];
        socket.emit("watchData", bps);
        socket.emit("watchData", bpd);
        index++;
      } else if (vitals[vitalType] && index < vitals[vitalType].length) {
        const vital = vitals[vitalType][index];
        socket.emit("watchData", vital);
        index++;
      } else {
        index = 0;
      }
    }, 2000);
  }

  if (vitalType) {
    if (!patientId) {
      patientId = await initialiseDb();
    }
    socket.emit("connectSmartWatch", patientId);
    sendVitals(vitalType);
  } else {
    console.error("No patient vital argument provided");
    process.exit(1);
  }
}

simulatePatientVitals();
