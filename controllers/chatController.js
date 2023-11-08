const Chat = require("../models/chat");

const createChat = async (req, res) => {
  try {
    const { virtualNurseId, bedsideNurseId } = req.body;

    const existingChat = await Chat.findOne({
      virtualNurse: virtualNurseId,
      bedsideNurse: bedsideNurseId,
    }).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    if (existingChat) {
      res.status(403).json({
        success: false,
        message: "cannot create a chat with the same nurse",
      });
      return;
    }

    const newChat = new Chat({
      virtualNurse: virtualNurseId,
      bedsideNurse: bedsideNurseId,
      messages: [],
    });

    await newChat.save();

    const chat = await Chat.findById(newChat._id).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    res.status(200).json({ success: true, data: chat });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

const createChatMessage = async (req, res) => {
  try {
    const { chatId, content, imageUrl, createdBy, alert, patient } = req.body;

    let existingChat = await Chat.findById(chatId);

    if (!existingChat) {
      res.status(500).json({
        message: `cannot find any chat with ID ${id}`,
      });
      return;
    }

    const newChatMessage = {
      content: content,
      imageUrl: imageUrl,
      createdBy: createdBy,
      alert: alert,
      patient: patient,
    };

    existingChat.messages.push(newChatMessage);
    await existingChat.save();

    existingChat = await Chat.findById(chatId).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    res.status(200).json({ success: true, data: existingChat });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

const updateChat = async (req, res) => {
  try {
    const { chatId, isArchived } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res
        .status(500)
        .json({ message: `cannot find any chat with ID ${id}` });
    }

    if (isArchived !== undefined) {
      chat.isArchived = isArchived;
    }

    await chat.save();

    const updatedChat = await Chat.findById(chatId).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    res.status(200).json(updatedChat);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

const updateChatMessage = async (req, res) => {
  try {
    const { chatId, msgId, content } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, "messages._id": msgId },
      { $set: { "messages.$.content": content } }
    );

    if (!chat) {
      return res
        .status(500)
        .json({ message: `cannot find any chat with ID ${id}` });
    }

    const updatedChat = await Chat.findById(chatId).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    res.status(200).json(updatedChat);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      res.status(500).json({ validationErrors });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

const getChats = async (req, res) => {
  try {
    if (req.query.ids) {
      const ids = req.query.ids.split(",");
      const chats = await Promise.all(
        ids.map(async (id) => {
          if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const chat = await Chat.findById(id).populate([
              { path: "virtualNurse" },
              { path: "bedsideNurse" },
              {
                path: "messages",
                populate: [
                  {
                    path: "patient",
                  },
                  {
                    path: "alert",
                    populate: [
                      {
                        path: "patient",
                      },
                    ],
                  },
                ],
              },
            ]);

            chat.messages.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

            if (!chat) {
              res.status(500).json({
                message: `cannot find any chat with ID ${id}`,
              });
            }
            return chat;
          } else {
            res.status(500).json({ message: `${id} is in wrong format` });
          }
        })
      );
      res.status(200).json(chats);
    } else {
      const chats = await Chat.find({});
      res.status(200).json({ success: true, data: chats });
    }
  } catch (e) {
    res.status(500).json({ message: false, error: e.message });
  }
};

const getChatsForVirtualNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const chats = await Chat.find({ virtualNurse: id }).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    chats.forEach((chat) => {
      chat.messages.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    res.status(200).json({ success: true, data: chats });
  } catch (e) {
    res.status(500).json({ message: false, error: e.message });
  }
};
const getChatsForBedsideNurse = async (req, res) => {
  try {
    const { id } = req.params;
    const chats = await Chat.find({ bedsideNurse: id }).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);
    chats.forEach((chat) => {
      chat.messages.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    res.status(200).json({ success: true, data: chats });
  } catch (e) {
    res.status(500).json({ message: false, error: e.message });
  }
};

const deleteChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findById(id);
    if (!chat) {
      return res
        .status(500)
        .json({ message: `cannot find any chat with ID ${id}` });
    }

    chat.isArchived = true;

    const archivedChat = await chat.save();
    res.status(200).json(archivedChat);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
};

const deleteChatMessageById = async (req, res) => {
  try {
    const { chatId, msgId } = req.params;
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { $pull: { messages: { _id: msgId } } }
    );

    if (!chat) {
      return res
        .status(500)
        .json({ message: `cannot find any chat with ID ${id}` });
    }

    const updatedChat = await Chat.findById(chatId).populate([
      { path: "virtualNurse" },
      { path: "bedsideNurse" },
      {
        path: "messages",
        populate: [
          {
            path: "patient",
          },
          {
            path: "alert",
            populate: [
              {
                path: "patient",
              },
            ],
          },
        ],
      },
    ]);

    res.status(200).json(updatedChat);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  createChat,
  createChatMessage,
  getChats,
  deleteChatById,
  deleteChatMessageById,
  updateChatMessage,
  updateChat,
  getChatsForVirtualNurse,
  getChatsForBedsideNurse,
};
