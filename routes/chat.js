const express = require("express");
const router = express.Router();
const Chat = require("../controllers/chatController");

router.post("/", Chat.createChat);
router.get("/", Chat.getChats);
router.get("/vn/:id", Chat.getChatsForVirtualNurse);
router.get("/bn/:id", Chat.getChatsForBedsideNurse);
router.delete("/:id", Chat.deleteChatById);
router.post("/message", Chat.createChatMessage);
router.delete("/message/:chatId/:msgId", Chat.deleteChatMessageById);
router.put("/message", Chat.updateChatMessage);
router.put("/", Chat.updateChat);

module.exports = router;