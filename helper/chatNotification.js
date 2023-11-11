const patientController = require("../controllers/patientController");
const pushNotification = require("./pushNotification");
const { alertStatusEnum, alertTypeEnum } = require("../models/alert");
const SmartBed = require("../models/smartbed");
const { Nurse, nurseStatusEnum } = require("../models/nurse");
const SERVER_URL = "http://localhost:3001";
const { io } = require("socket.io-client");
const socket = io(SERVER_URL);

const sendChat = async (chat, latestMessage) => {
  try {
    //make sure that the latest message comes from the virtual nurse
    if (chat.virtualNurse._id.toString() !== latestMessage.createdBy) return;

    await pushNotification.sendPushNotification(
      chat.bedsideNurse.mobilePushNotificationToken,
      "Message from " + chat.virtualNurse.name,
      latestMessage.content,
      "sendChat",
      chat._id.toString()
    );
  } catch (error) {
    console.error("Error sending chat:", error);
  }
};

module.exports = { sendChat };
