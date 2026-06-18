import webPush from "web-push";
import User from "../models/user.model.js";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

const subject =
  process.env.VAPID_SUBJECT ||
  process.env.VAPID_MAILTO ||
  "mailto:admin@example.com";

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

// 🌟 NEW CODES HELPER: Converts relative routes into absolute production URLs for mobile downloads
function getAbsoluteIconUrl(avatarUrl) {
  // If your live deployment uses a custom domain or Render link, fetch it from backend environment
  const liveOrigin = process.env.FRONTEND_URL || "https://onrender.com"; // 🌟 Change this string placeholder to match your exact live Render web address!

  if (!avatarUrl) {
    return `${liveOrigin}/logo.png`;
  }

  // If the user's avatar path is already a global link (like Clerk or imagekit), pass it directly
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    // If it's on ImageKit, force a circular radius crop so it looks like WhatsApp
    if (avatarUrl.includes("ik.imagekit.io")) {
      const separator = avatarUrl.includes("?") ? "&" : "?";
      return `${avatarUrl}${separator}tr=w-192,h-192,fo-face,r-max`;
    }
    return avatarUrl;
  }

  // Otherwise append your production URL prefix context
  return `${liveOrigin}${avatarUrl}`;
}

export async function sendMessagePushNotification({
  receiverId,
  sender,
  message,
}) {
  if (!hasPushConfig) return;

  const receiver = await User.findById(receiverId).select("pushSubscriptions");
  const subscriptions = receiver?.pushSubscriptions || [];
  if (!subscriptions.length) return;

  // 🌟 FIXED: Passing fully qualified absolute web links so smartphones capture full color layout matrices
  const payload = JSON.stringify({
    title: sender?.fullName || "New message",
    body: getMessageBody(message),
    icon: getAbsoluteIconUrl(sender?.profilePic), // 🟢 Forces full color website logo or circular profile pic
    badge: "/favicon.svg", // This is the status bar stencil badge (system overrides this to solid white by law)
    tag: `message-${message.senderId}`,
    url: "/",
    senderId: String(message.senderId),
    messageId: String(message._id),
  });

  const staleEndpoints = [];

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          subscription.toObject?.() || subscription,
          payload,
        );
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
