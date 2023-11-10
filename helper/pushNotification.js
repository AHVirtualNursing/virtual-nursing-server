const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (
  devicePushToken,
  title,
  body,
  notificationType,
  dataId
) => {
  await firebaseAdmin.messaging().send({
    token: devicePushToken,
    notification: {
      title: title,
      body: body,
    },
    data: {
      type: notificationType,
      dataId: dataId //Alert id or reminder id
    },
  });
};

module.exports = { sendPushNotification };
