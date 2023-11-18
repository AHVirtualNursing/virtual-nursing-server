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
            const smartbed = await SmartBed.findOne({
              patient: patient._id.toString(),
            });

            if (smartbed) {
              patientMap.set(patientNric, {
                patientId: patient._id.toString(),
                patientFallRisk: [],
                patientAcuityLevel: [],
                smartbedId: smartbed._id.toString(),
                smartbedStatus: {
                  bedPosition: [],
                  isRightUpperRail: [],
                  isRightLowerRail: [],
                  isLeftUpperRail: [],
                  isLeftLowerRail: [],
                  isBrakeSet: [],
                  isLowestPosition: [],
                  isBedExitAlarmOn: [],
                  isPatientOnBed: [],
                },
                vitals: {
                  heartRate: [],
                  respRate: [],
                  spO2: [],
                  bloodPressureSys: [],
                  bloodPressureDia: [],
                  temperature: [],
                },
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
        vitalType === "bedPosition" ||
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
      } else if (vitalType === "acuityLevel") {
        patientMap.get(patientNric).patientAcuityLevel.push(vitalValue);
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
        sendBedStatus("bedPosition", patientData);
      }, 500);
      setTimeout(() => {
        sendBedStatus("isRightUpperRail", patientData);
      }, 600);
      setTimeout(() => {
        sendBedStatus("isRightLowerRail", patientData);
      }, 700);
      setTimeout(() => {
        sendBedStatus("isLeftUpperRail", patientData);
      }, 800);
      setTimeout(() => {
        sendBedStatus("isLeftLowerRail", patientData);
      }, 900);
      setTimeout(() => {
        sendBedStatus("isBrakeSet", patientData);
      }, 1000);
      setTimeout(() => {
        sendBedStatus("isLowestPosition", patientData);
      }, 1100);
      setTimeout(() => {
        sendBedStatus("isBedExitAlarmOn", patientData);
      }, 1200);
      setTimeout(() => {
        sendBedStatus("isPatientOnBed", patientData);
      }, 1300);
      setTimeout(() => {
        sendBedStatus("fallRisk", patientData);
      }, 1400);
      setTimeout(() => {
        sendBedStatus("acuityLevel", patientData);
      }, 1500);
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

  async function sendBedStatus(bedStatusType, patient) {
    let index = 0;
    const intervalId = setInterval(async () => {
      // for (const patientData of patientMap.values()) {
      if (bedStatusType === "fallRisk") {
        if (index < patient.patientFallRisk.length) {
          await callApiRequest(
            `${SERVER_URL}/patient/${patient.patientId}`,
            "PUT",
            {
              fallRisk: patient.patientFallRisk[index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "acuityLevel") {
        if (index < patient.patientAcuityLevel.length) {
          await callApiRequest(
            `${SERVER_URL}/patient/${patient.patientId}`,
            "PUT",
            {
              acuityLevel: patient.patientAcuityLevel[index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "bedPosition") {
        if (index < patient.smartbedStatus["bedPosition"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              bedPosition: patient.smartbedStatus["bedPosition"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isRightUpperRail") {
        if (index < patient.smartbedStatus["isRightUpperRail"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isRightUpperRail:
                patient.smartbedStatus["isRightUpperRail"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isRightLowerRail") {
        if (index < patient.smartbedStatus["isRightLowerRail"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isRightLowerRail:
                patient.smartbedStatus["isRightLowerRail"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isLeftUpperRail") {
        if (index < patient.smartbedStatus["isLeftUpperRail"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isLeftUpperRail: patient.smartbedStatus["isLeftUpperRail"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isLeftLowerRail") {
        if (index < patient.smartbedStatus["isLeftLowerRail"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isLeftLowerRail: patient.smartbedStatus["isLeftLowerRail"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isBrakeSet") {
        if (index < patient.smartbedStatus["isBrakeSet"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isBrakeSet: patient.smartbedStatus["isBrakeSet"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isLowestPosition") {
        if (index < patient.smartbedStatus["isLowestPosition"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isLowestPosition:
                patient.smartbedStatus["isLowestPosition"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isBedExitAlarmOn") {
        if (index < patient.smartbedStatus["isBedExitAlarmOn"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isBedExitAlarmOn:
                patient.smartbedStatus["isBedExitAlarmOn"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      } else if (bedStatusType === "isPatientOnBed") {
        if (index < patient.smartbedStatus["isPatientOnBed"].length) {
          await callApiRequest(
            `${SERVER_URL}/smartbed/${patient.smartbedId}`,
            "PUT",
            {
              isPatientOnBed: patient.smartbedStatus["isPatientOnBed"][index],
            }
          );
        } else {
          clearInterval(intervalId);
        }
      }
      index++;
      // }
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
