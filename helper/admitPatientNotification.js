const patientController = require("../controllers/patientController");
const pushNotification = require("./pushNotification");

const sendAdmitPatientNotification = async (patient, nurses) => {
  try {
    const body = "Ready to Admit " + patient.name;
    for (const nurse of nurses) {
      await pushNotification.sendPushNotification(
        nurse.mobilePushNotificationToken,
        "Patient Admittance",
        body,
        "sendPatient",
        patient._id.toString()
      );
    }
  } catch (error) {
    console.error("Error sending Admit Notification:", error);
  }
};

module.exports = { sendAdmitPatientNotification };
