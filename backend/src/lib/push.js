import webPush from "web-push";
import User from "../models/user.model.js";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

// 🟢 FIXED: Swapped priority so it defaults to mailto if explicit VAPID envs are empty
const subject =
  process.env.VAPID_SUBJECT ||
  process.env.VAPID_MAILTO ||
  "mailto:admin@example.com"; // 🌟 Moved this above FRONTEND_URL

const hasPushConfig = Boolean(publicKey && privateKey);

if (hasPushConfig) {
  webPush.setVapidDetails(subject, publicKey, privateKey);
}

function getMessageBody(message) {
  if (message.text?.trim()) return message.text.trim();
  if (message.image) return "Sent a photo";
  if (message.video) return "Sent a video";
  return "Sent a message";
}

export async function sendMessagePushNotification({ receiverId, sender, message }) {
  if (!hasPushConfig) return;

  const receiver = await User.findById(receiverId).select("pushSubscriptions");
  const subscriptions = receiver?.pushSubscriptions || [];
  if (!subscriptions.length) return;

  const payload = JSON.stringify({
    title: sender?.fullName || "New message",
    body: getMessageBody(message),
    icon: sender?.profilePic || "/logo.png",
    badge: "/favicon.svg",
    tag: `message-${message.senderId}`,
    url: "/",
    senderId: String(message.senderId),
    messageId: String(message._id),
  });

  const staleEndpoints = [];

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(subscription.toObject?.() || subscription, payload);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          staleEndpoints.push(subscription.endpoint);
          return;
        }

        console.error("Error sending push notification:", error.message);
      }
    }),
  );

  if (staleEndpoints.length) {
    await User.updateOne(
      { _id: receiverId },
      { $pull: { pushSubscriptions: { endpoint: { $in: staleEndpoints } } } },
    );
  }
}
