require("dotenv").config();
const mongoose = require("mongoose");
const { io } = require("socket.io-client");
const axios = require("axios");
const xlsx = require("xlsx");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("./awsClient");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { initialiseDb } = require("../scripts/initialiseDb");
const Patient = require("../models/patient");

const SERVER_URL = "http://localhost:3001";
let intervalId;

async function sendMockPatientVitals() {
  mongooseConnect();

  const socket = io(SERVER_URL);
  const patientMap = new Map();

  const vitals = {
    heartRate: [],
    respRate: [],
    spO2: [],
    bloodPressureSys: [],
    bloodPressureDia: [],
    temperature: [],
  };

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

  async function processData(data) {
    const patients = await Patient.find();
    if (!patients) {
      await initialiseDb();
    }

    const promises = data.map(async (vital) => {
      const patientNric = vital["PATIENT_NRIC"].toString();

      if (!patientMap.get(patientNric)) {
        try {
          const patient = await Patient.findOne({ nric: patientNric });

          if (patient) {
            patientMap.set(patientNric, {
              patientId: patient._id.toString(),
              vitals: vitals,
            });
          } else {
            console.error(`Patient not found for NRIC: ${patientNric}`);
            return;
          }
        } catch (error) {
          console.error(
            `Error fetching patient for NRIC ${patientNric}: ${error}`
          );
          return;
        }
      }

      const vitalType = vital["TYPE"];
      const vitalValue = vital["VALUE"];

      if (vitalType === "bloodPressure") {
        const bpReadings = vitalValue.split("/");
        patientMap
          .get(patientNric)
          .vitals["bloodPressureSys"].push(bpReadings[0]);
        patientMap
          .get(patientNric)
          .vitals["bloodPressureDia"].push(bpReadings[1]);
      } else {
        patientMap.get(patientNric).vitals[vitalType].push(vitalValue);
      }
    });

    await Promise.all(promises);
  }

  function sendVitals(vitalType) {
    let index = 0;

    for (const patientData of patientMap.values()) {
      socket.emit("connectSmartWatch", patientData.patientId);
    }

    intervalId = setInterval(() => {
      for (const patientData of patientMap.values()) {
        if (vitalType === "bloodPressure") {
          const bpsVital = {
            datetime: getCurrentFormattedDatetime(),
            patientId: patientData.patientId,
            bloodPressureSys: parseInt(
              patientData.vitals["bloodPressureSys"][index]
            ),
          };
          const bpdVital = {
            datetime: getCurrentFormattedDatetime(),
            patientId: patientData.patientId,
            bloodPressureDia: parseInt(
              patientData.vitals["bloodPressureDia"][index]
            ),
          };
          socket.emit("watchData", bpsVital);
          socket.emit("watchData", bpdVital);
          index++;
        } else {
          const vital = {
            datetime: getCurrentFormattedDatetime(),
            patientId: patientData.patientId,
            [vitalType]: parseInt(patientData.vitals[vitalType][index]),
          };

          socket.emit("watchData", vital);
          index++;
        }
      }
    }, 2000);
  }

  const data = await parseMockDataFromS3();

  await processData(data);

  sendVitals("heartRate");
  setTimeout(() => {
    sendVitals("spO2");
  }, 100);
  setTimeout(() => {
    sendVitals("bloodPressure");
  }, 200);
  setTimeout(() => {
    sendVitals("temperature");
  }, 300);
  setTimeout(() => {
    sendVitals("respRate");
  }, 400);
}

async function parseMockDataFromS3() {
  const command = new GetObjectCommand({
    Bucket: "ah-virtual-nursing",
    Key: "mock-data/DE2300223_enc.xlsx",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 600 });

  const res = await axios.get(url, { responseType: "arraybuffer" });

  if (res.status === 200) {
    const workbook = xlsx.read(res.data, {
      type: "buffer",
    });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    return data;
  }
}

function clearInterval() {
  console.log(intervalId);
  console.log("Clearing mock data simulation interval");
  clearInterval(intervalId);
}

module.exports = {
  sendMockPatientVitals,
  clearInterval,
};
