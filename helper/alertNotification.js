const patientController = require("../controllers/patientController");
const pushNotification = require("./pushNotification");
const { alertStatusEnum, alertTypeEnum } = require("../models/alert");
const { SmartBed } = require("../models/smartbed");
const { Nurse, nurseStatusEnum } = require("../models/nurse");
const SERVER_URL = "http://localhost:3001";
const { io } = require("socket.io-client");
const socket = io(SERVER_URL);

const sendAlert = async (alert) => {
  try {
    const patientId = alert.patient;
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

    await patientController.getPatientById(req, res);
    const patient = res.jsonData;

    var nurses = [];
    if (!alert.redelegate) {
      await patientController.getNursesByPatientId(req, res);
      nurses = res.jsonData;
    } else {
      const smartBed = await SmartBed.findOne({ patient: patientId });
      const wardId = smartBed.ward;
      nurses = await Nurse.find({
        nurseStatus: nurseStatusEnum[1],
        ward: wardId,
      });
    }
    let alertTitle = "Alert";
    if (alert.alertType === alertTypeEnum[0]) {
      alertTitle = "Patient Alert";
    } else if (alert.alertType === alertTypeEnum[1]) {
      alertTitle = "Bed Alert";
    }

    for (const nurse of nurses) {
      const body = patient.name + ": " + alert.description;
      await pushNotification.sendPushNotification(
        nurse.mobilePushNotificationToken,
        alertTitle,
        body,
        "sendAlert",
        alert._id.toString()
      );
    }

    if (!alert.redelegate) {
      startAlertStatusCheckTimer(alert);
    }
  } catch (error) {
    console.error("Error sending alert:", error);
  }
};

const startAlertStatusCheckTimer = (alert) => {
  const delayInMilliseconds = 60000;

  setTimeout(async () => {
    if (alert.status === alertStatusEnum[0]) {
      await handleUnacknowledgedAlert(alert);
    }
  }, delayInMilliseconds);
};

const handleUnacknowledgedAlert = async (alert) => {
  alert.redelegate = true;
  alert.save();
  socket.emit("new-alert", alert);
};

module.exports = { sendAlert };
