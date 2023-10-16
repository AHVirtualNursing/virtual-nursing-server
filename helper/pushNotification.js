const admin = require('firebase-admin')


const serviceAccount = require("../serviceAccountKey.json")

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

const sendPushNotification = async (devicePushToken, title, body) => {
    console.log("sending");
    await firebaseAdmin.messaging().send({
        token: devicePushToken,
        notification: {
            title,
            body,
        }
    })
}

module.exports = {sendPushNotification}