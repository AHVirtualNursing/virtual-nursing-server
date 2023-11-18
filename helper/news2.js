const schedule = require('node-schedule');
const patientController = require("../controllers/patientController");
const vitalController = require("../controllers/vitalController");
const { patientO2IntakeEnum } = require("../models/patient");
const { patientConsciousnessEnum } = require("../models/patient");
const { io } = require("socket.io-client");
const SERVER_URL = "http://localhost:3001";
const socket = io(SERVER_URL);

const scheduleNews2 = schedule.scheduleJob("*/5 * * * *", async () => {
  try{
  
  const req = {};
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

  await patientController.getPatients(req, res);
  const patients = res.jsonData;
  
  for (const patient of patients) {
    await calculateNews2(patient);
  }
  } catch (error) {
    console.error("Error updating News2:", error);
  }
  
});

const calculateNews2 = async (patient) => {
  try {
  const req = { params: { id: patient.vital } };
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

  score = 0;
  if (!patient.vital) {
    return;
  }

  await vitalController.getVitalById(req, res);
  const vital = res.jsonData;

  if (!vital) {
    return;
  }

  if (vital.respRate.length > 0) {
    respRate = vital.respRate[vital.respRate.length - 1]["reading"];
    if (respRate <= 8 || respRate >= 25) {
      score += 3;
    } else if (respRate <= 11 || respRate >= 21) {
      score += 1;
    }
  }

  if (vital.heartRate.length > 0) {
    heartRate = vital.heartRate[vital.heartRate.length - 1]["reading"];
    if (heartRate <= 40 || heartRate >= 131) {
      score += 3;
    } else if (heartRate >= 111) {
      score += 2;
    } else if (heartRate <= 50 || heartRate >= 91) {
      score += 1;
    }
  }

  if (patient.o2Intake === patientO2IntakeEnum[1]) {
    score += 2;
  }

  if (patient.consciousness === patientConsciousnessEnum[1]) {
    score += 3;
  }

  if (vital.spO2.length > 0) {
    oxygenLevel = vital.spO2[vital.spO2.length - 1]["reading"];
    if (oxygenLevel <= 91) {
      score += 3;
    } else if (oxygenLevel <= 93) {
      score += 2;
    } else if (oxygenLevel <= 95) {
      score += 1;
    }
  }

  if (vital.bloodPressureSys.length > 0) {
    bpSys =
      vital.bloodPressureSys[vital.bloodPressureSys.length - 1]["reading"];
    if (bpSys <= 90) {
      score += 3;
    } else if (bpSys <= 100) {
      score += 2;
    } else if (bpSys <= 110) {
      score += 1;
    }
  }

  if (vital.temperature.length > 0) {
    temp = vital.temperature[vital.temperature.length - 1]["reading"];
    if (temp <= 35) {
      score += 3;
    } else if (temp >= 39.1) {
      score += 2;
    } else if (temp <= 36 || temp >= 38.1) {
      score += 1;
    }
  }

  const vitalsReading = {
    reading: score,
    datetime: new Date(),
  };
  
  vital.news2Score.push(vitalsReading);
  const updatedVital = await vital.save();
  socket.emit("update-vitals", updatedVital, patient._id);
  } catch (error) {
    console.error("Error updating News2:", error);
  }
  
};




module.exports = { scheduleNews2 };