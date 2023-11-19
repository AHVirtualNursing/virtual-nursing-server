const patientController = require("../controllers/patientController");
const pushNotification = require("./pushNotification");

const sendAdmitPatientNotification = async (patient, nurses) => {
  try {
    const body = "Ready to Admit " + patient.name;
    for (const nurse of nurses) {
      try {
        await pushNotification.sendPushNotification(
          nurse.mobilePushNotificationToken,
          "Patient Admittance",
          body,
          "sendPatient",
          patient._id.toString()
        );
      } catch (e) {
        console.error("Error sending admit patient noti for nurse", nurse.name);
      }
    }
  } catch (error) {
    console.error("Error sending Admit Notification:", error);
  }
};

module.exports = { sendAdmitPatientNotification };
