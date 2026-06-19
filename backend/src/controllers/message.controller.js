import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketIds, io } from "../lib/socket.js";
import { sendMessagePushNotification } from "../lib/push.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", loggedInUserId] },
                    { $not: [{ $in: [loggedInUserId, { $ifNull: ["$readBy", []] }] }] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$user",
              {
                lastMessage: {
                  _id: "$lastMessage._id",
                  senderId: "$lastMessage.senderId",
                  receiverId: "$lastMessage.receiverId",
                  text: "$lastMessage.text",
                  image: "$lastMessage.image",
                  video: "$lastMessage.video",
                  readBy: "$lastMessage.readBy",
                  deliveredTo: "$lastMessage.deliveredTo",
                  editedAt: "$lastMessage.editedAt",
                  createdAt: "$lastMessage.createdAt",
                },
                unreadCount: "$unreadCount",
              },
            ],
          },
        },
      },
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const unreadMessages = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      readBy: { $ne: myId },
    }).select("_id");

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, readBy: { $ne: myId } },
      { $addToSet: { readBy: myId } },
    );

    const readMessageIds = unreadMessages.map((message) => String(message._id));
    if (readMessageIds.length) {
      getReceiverSocketIds(userToChatId).forEach((socketId) => {
        io.to(socketId).emit("messagesRead", {
          readerId: String(myId),
          messageIds: readMessageIds,
        });
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .populate("replyTo", "senderId receiverId text image video createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;
    const receiverSocketIds = getReceiverSocketIds(receiverId);

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    let replyToMessageId;
    if (replyTo) {
      const repliedMessage = await Message.findOne({
        _id: replyTo,
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      }).select("_id");

      if (!repliedMessage) {
        return res.status(400).json({ message: "Reply target was not found in this chat" });
      }

      replyToMessageId = repliedMessage._id;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      replyTo: replyToMessageId,
      readBy: [senderId],
      deliveredTo: receiverSocketIds.length ? [receiverId] : [],
    });

    await newMessage.save();
    await newMessage.populate("replyTo", "senderId receiverId text image video createdAt");

    // only send the message in realtime if user is online
    receiverSocketIds.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    });

    if (receiverSocketIds.length === 0) {
      sendMessagePushNotification({
        receiverId,
        sender: req.user,
        message: newMessage,
      }).catch((error) => {
        console.error("Error queueing push notification:", error.message);
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({ _id: messageId, senderId: userId });

    if (!message) {
      return res.status(404).json({ message: "You can only delete messages you sent" });
    }

    await Message.deleteOne({ _id: message._id });

    const payload = {
      messageId: String(message._id),
      senderId: String(message.senderId),
      receiverId: String(message.receiverId),
    };

    [message.senderId, message.receiverId].forEach((participantId) => {
      getReceiverSocketIds(participantId).forEach((socketId) => {
        io.to(socketId).emit("messageDeleted", payload);
      });
    });

    res.status(200).json(payload);
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateMessage(req, res) {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;
    const text = req.body?.text?.trim();

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await Message.findOne({ _id: messageId, senderId: userId });

    if (!message) {
      return res.status(404).json({ message: "You can only edit messages you sent" });
    }

    message.text = text;
    message.editedAt = new Date();
    await message.save();
    await message.populate("replyTo", "senderId receiverId text image video createdAt");

    [message.senderId, message.receiverId].forEach((participantId) => {
      getReceiverSocketIds(participantId).forEach((socketId) => {
        io.to(socketId).emit("messageEdited", message);
      });
    });

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in updateMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function savePushSubscription(req, res) {
  try {
    const { endpoint, expirationTime = null, keys } = req.body || {};

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Invalid push subscription" });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { pushSubscriptions: { endpoint } } },
    );

    await User.updateOne(
      { _id: req.user._id },
      {
        $push: {
          pushSubscriptions: {
            endpoint,
            expirationTime,
            keys: {
              p256dh: keys.p256dh,
              auth: keys.auth,
            },
          },
        },
      },
    );

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error in savePushSubscription:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
