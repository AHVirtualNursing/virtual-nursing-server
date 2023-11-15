const pushNotification = require("./pushNotification");
const { io } = require("socket.io-client");
const socket = io(process.env.SERVER_URL);

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
