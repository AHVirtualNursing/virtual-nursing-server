const patientController = require("../controllers/patientController");
const pushNotification = require("./pushNotification");

const sendAdmitPatientNotification = async(patient) => {

    try {
    const req = { params: { id: patient._id } };
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

   
    await patientController.getNursesByPatientId(req, res);
    const nurses = res.jsonData;
    const body = "Ready to Admit " + patient.name 
  
    for (const nurse of nurses) {
        console.log("sending");
        await pushNotification.sendPushNotification(
            nurse.mobilePushNotificationToken,
            "Patient Admittance",
            body,
            "sendAdmitPatient",
            patient._id.toString())

    }
    } catch (error) {
    console.error("Error sending Admit Notification:", error);
    }
}

module.exports = {sendAdmitPatientNotification};