require("dotenv").config();
const { mongooseConnect } = require("../middleware/mongoose");
const { io } = require("socket.io-client");
const axios = require("axios");
const xlsx = require("xlsx");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("./awsClient");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { initialiseDb } = require("../scripts/initialiseDb");
const { Patient } = require("../models/patient");

const SERVER_URL = "http://localhost:3001";

async function sendMockPatientVitals() {
  await mongooseConnect();

  const socket = io(SERVER_URL);
  const patientMap = new Map();

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

    for (const vital of data) {
      const patientNric = vital["PATIENT_NRIC"].toString();

      if (!patientMap.has(patientNric)) {
        try {
          const patient = await Patient.findOne({ nric: patientNric });

          if (patient) {
            patientMap.set(patientNric, {
              patientId: patient._id.toString(),
              vitals: {
                heartRate: [],
                respRate: [],
                spO2: [],
                bloodPressureSys: [],
                bloodPressureDia: [],
                temperature: [],
              },
            });
            console.log("MAP");
            console.log(patientMap.keys());
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
    }
  }

  function sendData() {
    for (const patientData of patientMap.values()) {
      socket.emit("connectSmartWatch", patientData.patientId);
      sendVitals("heartRate", patientData);

      setTimeout(() => {
        sendVitals("spO2", patientData);
      }, 100);
      setTimeout(() => {
        sendVitals("bloodPressure", patientData);
      }, 200);
      setTimeout(() => {
        sendVitals("temperature", patientData);
      }, 300);
      setTimeout(() => {
        sendVitals("respRate", patientData);
      }, 400);
    }

    //   intervalId = setInterval(() => {
    //     for (const patientData of patientMap.values()) {
    //       console.log(patientData.patientId);
    //       if (vitalType === "bloodPressure") {
    //         const bpsVital = {
    //           datetime: getCurrentFormattedDatetime(),
    //           patientId: patientData.patientId,
    //           bloodPressureSys: parseInt(
    //             patientData.vitals["bloodPressureSys"][index]
    //           ),
    //         };
    //         const bpdVital = {
    //           datetime: getCurrentFormattedDatetime(),
    //           patientId: patientData.patientId,
    //           bloodPressureDia: parseInt(
    //             patientData.vitals["bloodPressureDia"][index]
    //           ),
    //         };
    //         socket.emit("watchData", bpsVital);
    //         socket.emit("watchData", bpdVital);
    //         index++;
    //       } else {
    //         const vital = {
    //           datetime: getCurrentFormattedDatetime(),
    //           patientId: patientData.patientId,
    //           [vitalType]: parseInt(patientData.vitals[vitalType][index]),
    //         };
    //         console.log(index);

    //         console.log(vital);

    //         socket.emit("watchData", vital);
    //         index++;
    //       }
    //     }
    //   }, 2000);
    // }

    function sendVitals(vitalType, patient) {
      let index = 0;

      const intervalId = setInterval(() => {
        if (vitalType === "bloodPressure") {
          if (index < patient.vitals["bloodPressureSys"].length) {
            const bpsVital = {
              datetime: getCurrentFormattedDatetime(),
              patientId: patient.patientId,
              bloodPressureSys: parseInt(
                patient.vitals["bloodPressureSys"][index]
              ),
            };
            const bpdVital = {
              datetime: getCurrentFormattedDatetime(),
              patientId: patient.patientId,
              bloodPressureDia: parseInt(
                patient.vitals["bloodPressureDia"][index]
              ),
            };
            socket.emit("watchData", bpsVital);
            socket.emit("watchData", bpdVital);
          } else {
            clearInterval(intervalId);
          }
        } else {
          if (index < patient.vitals[vitalType].length) {
            const vital = {
              datetime: getCurrentFormattedDatetime(),
              patientId: patient.patientId,
              [vitalType]: parseInt(patient.vitals[vitalType][index]),
            };

            console.log(index);
            console.log(vital);

            socket.emit("watchData", vital);
          } else {
            clearInterval(intervalId);
          }
        }

        index++;
      }, 2000);
    }
  }

  const data = await parseMockDataFromS3();

  await processData(data);

  console.log(patientMap.values());
  sendData();
  // sendVitals("heartRate");
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // sendVitals("spO2");
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // sendVitals("bloodPressure");
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // sendVitals("temperature");
  // await new Promise((resolve) => setTimeout(resolve, 2000));
  // sendVitals("respRate");
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
  clearInterval,
};
