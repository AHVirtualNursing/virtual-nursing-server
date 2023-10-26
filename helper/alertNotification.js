const patientController = require("../controllers/patientController");

async function sendAlert(alert) {
    try{
        const patient = alert.patient;
        const req = { params: { id: patient } };
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

        for(const nurse of nurses){

            await pushNotification.sendPushNotification(nurse.mobilePushNotificationToken, "Alert", alert.description);
        }

    }catch (error) {
        console.error('Error sending alert:', error);
      }

}

module.exports = {sendAlert}