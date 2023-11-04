require("dotenv").config();
const { io } = require("socket.io-client");
const axios = require("axios");
const xlsx = require("xlsx");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../middleware/awsClient");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { initialiseDb } = require("./initialiseDb");
const SERVER_URL = "http://localhost:3001";

async function sendMockPatientVitals(patientId) {
  const socket = io(SERVER_URL);

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

  function processData(data) {
    return data.map((vital) => {
      const vitalType = vital["FLWSHT_TYPE"].split("_")[1];

      if (vitalType === "bloodPressure") {
        const bpReadings = vital["FLWSHT_VALUE"].split("/");
        vitals["bloodPressureSys"].push(bpReadings[0]);
        vitals["bloodPressureDia"].push(bpReadings[1]);
      } else {
        vitals[vitalType].push(vital["FLWSHT_VALUE"]);
      }
    });
  }

  function sendVitals(vitalType) {
    let index = 0;
    setInterval(() => {
      if (vitalType === "bloodPressure") {
        const bpsVital = {
          datetime: getCurrentFormattedDatetime(),
          patientId: patientId,
          bloodPressureSys: parseInt(vitals["bloodPressureSys"][index]),
        };
        const bpdVital = {
          datetime: getCurrentFormattedDatetime(),
          patientId: patientId,
          bloodPressureDia: parseInt(vitals["bloodPressureDia"][index]),
        };
        socket.emit("watchData", bpsVital);
        socket.emit("watchData", bpdVital);
        index++;
      } else {
        const vital = {
          datetime: getCurrentFormattedDatetime(),
          patientId: patientId,
          [vitalType]: parseInt(vitals[vitalType][index]),
        };

        socket.emit("watchData", vital);
        index++;
      }
    }, 2000);
  }

  if (!patientId) {
    patientId = (await initialiseDb()).toString();
  }

  socket.emit("connectSmartWatch", patientId);

  const data = await parseMockDataFromS3();

  processData(data);

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

module.exports = {
  sendMockPatientVitals,
};
