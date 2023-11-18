require("dotenv").config();
const { mongooseConnect } = require("../middleware/mongoose");
const { io } = require("socket.io-client");
const axios = require("axios");
const xlsx = require("xlsx");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("./awsClient");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { initialiseDb, callApiRequest } = require("../scripts/initialiseDb");
const { Patient } = require("../models/patient");
const { SmartBed } = require("../models/smartbed");

const SERVER_URL = "http://localhost:3001";

async function sendMockPatientVitals() {
  await mongooseConnect();

  const socket = io(SERVER_URL);
  const patientMap = new Map();

  const smartbedStatus = {
    bedPosition: [],
    isRightUpperRail: [],
    isRightLowerRail: [],
    isLeftUpperRail: [],
    isLeftLowerRail: [],
    isBrakeSet: [],
    isLowestPosition: [],
    isBedExitAlarmOn: [],
    isPatientOnBed: [],
  };

  const patientFallRisk = [];

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

            if (smartbed) {
              patientMap.set(patientNric, {
                patientId: patient._id.toString(),
                patientFallRisk: patientFallRisk,
                smartbedId: smartbed._id.toString(),
                smartbedStatus: smartbedStatus,
                vitals: vitals,
              });
            } else {
              console.error(
                `Patient of NRIC: ${patientNric} does not have valid smartbed`
              );
              return;
            }
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

      // Add in Bed Status

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
      } else if (
        vitalType === "isRightUpperRail" ||
        vitalType === "isRightLowerRail" ||
        vitalType === "isLeftUpperRail" ||
        vitalType === "isLeftLowerRail" ||
        vitalType === "isBrakeSet" ||
        vitalType === "isLowestPosition" ||
        vitalType === "isBedExitAlarmOn" ||
        vitalType === "isPatientOnBed"
      ) {
        patientMap.get(patientNric).smartbedStatus[vitalType].push(vitalValue);
      } else if (vitalType === "fallRisk") {
        patientMap.get(patientNric).patientFallRisk.push(vitalValue);
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

      setTimeout(() => {
        sendBedStatus("bedPosition");
      }, 500);
      setTimeout(() => {
        sendBedStatus("isRightUpperRail");
      }, 600);
      setTimeout(() => {
        sendBedStatus("isRightLowerRail");
      }, 700);
      setTimeout(() => {
        sendBedStatus("isLeftUpperRail");
      }, 800);
      setTimeout(() => {
        sendBedStatus("isLeftLowerRail");
      }, 900);
      setTimeout(() => {
        sendBedStatus("isBrakeSet");
      }, 1000);
      setTimeout(() => {
        sendBedStatus("isLowestPosition");
      }, 1100);
      setTimeout(() => {
        sendBedStatus("isBedExitAlarmOn");
      }, 1200);
      setTimeout(() => {
        sendBedStatus("isPatientOnBed");
      }, 1300);
      setTimeout(() => {
        sendBedStatus("fallRisk");
      }, 1400);
    }

    function sendVitals(vitalType, patient) {
      let index = 0;

      // intervalId = setInterval(() => {
      //   for (const patientData of patientMap.values()) {
      //     if (vitalType === "bloodPressure") {
      //       const bpsVital = {
      //         datetime: getCurrentFormattedDatetime(),
      //         patientId: patientData.patientId,
      //         bloodPressureSys: parseInt(
      //           patientData.vitals["bloodPressureSys"][index]
      //         ),
      //       };
      //       const bpdVital = {
      //         datetime: getCurrentFormattedDatetime(),
      //         patientId: patientData.patientId,
      //         bloodPressureDia: parseInt(
      //           patientData.vitals["bloodPressureDia"][index]
      //         ),
      //       };
      //       socket.emit("watchData", bpsVital);
      //       socket.emit("watchData", bpdVital);
      //       index++;
      //     } else if (
      //       vitalType === "heartRate" ||
      //       vitalType === "respRate" ||
      //       vitalType === "spO2" ||
      //       vitalType === "temperature"
      //     ) {
      //       const vital = {
      //         datetime: getCurrentFormattedDatetime(),
      //         patientId: patientData.patientId,
      //         [vitalType]: parseInt(patientData.vitals[vitalType][index]),
      //       };

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
        } else if (
          vitalType === "heartRate" ||
          vitalType === "respRate" ||
          vitalType === "spO2" ||
          vitalType === "temperature"
        ) {
          if (index < patient.vitals[vitalType].length) {
            const vital = {
              datetime: getCurrentFormattedDatetime(),
              patientId: patient.patientId,
              [vitalType]: parseInt(patient.vitals[vitalType][index]),
            };
            socket.emit("watchData", vital);
          } else {
            clearInterval(intervalId);
          }
        }

        index++;
      }, 2000);
    }
  }

  async function sendBedStatus(bedStatusType) {
    let index = 0;
    intervalId = setInterval(async () => {
      for (const patientData of patientMap.values()) {
        if (bedStatusType === "fallRisk") {
          await callApiRequest(
            `${SERVER_URL}/patient/${patientData.patientId}`,
            "PUT",
            {
              fallRisk: patientData.patientFallRisk[index],
            }
          );
          index++;
        } else if (bedStatusType === "bedPosition") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              bedPosition: patientData.smartbedStatus["bedPosition"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isRightUpperRail") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isRightUpperRail:
                patientData.smartbedStatus["isRightUpperRail"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isRightLowerRail") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isRightLowerRail:
                patientData.smartbedStatus["isRightLowerRail"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isLeftUpperRail") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isLeftUpperRail:
                patientData.smartbedStatus["isLeftUpperRail"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isLeftLowerRail") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isLeftLowerRail:
                patientData.smartbedStatus["isLeftLowerRail"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isBrakeSet") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isBrakeSet: patientData.smartbedStatus["isBrakeSet"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isLowestPosition") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isLowestPosition:
                patientData.smartbedStatus["isLowestPosition"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isBedExitAlarmOn") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isBedExitAlarmOn:
                patientData.smartbedStatus["isBedExitAlarmOn"][index],
            }
          );
          index++;
        } else if (bedStatusType === "isPatientOnBed") {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patientData.smartbedId}`,
            "PUT",
            {
              isPatientOnBed:
                patientData.smartbedStatus["isPatientOnBed"][index],
            }
          );
          index++;
        }
      }
    }, 2000);
  }

  const data = await parseMockDataFromS3();

  await processData(data);
  sendData();
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
