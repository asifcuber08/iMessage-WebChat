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

// Helper function to get the absolute URL for the sender's avatar photo
function getAbsoluteIconUrl(avatarUrl) {
  const liveOrigin = process.env.FRONTEND_URL || "https://onrender.com"; 

  if (!avatarUrl) {
    return `${liveOrigin}/logo.png`; 
  }

  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    if (avatarUrl.includes("ik.imagekit.io")) {
      const separator = avatarUrl.includes("?") ? "&" : "?";
      return `${avatarUrl}${separator}tr=w-192,h-192,fo-face,r-max`; 
    }
    return avatarUrl;
  }

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

  // 🌟 FIX: Separate the status bar icon from the sender's profile picture avatar
  const payload = JSON.stringify({
    title: sender?.fullName || "New message",
    body: getMessageBody(message),
    
    // 🛠️ Force the icon and badge to use your dedicated transparent monochrome asset
    icon: "/notification-monochrome.png", 
    badge: "/notification-monochrome.png",
    
    // 📸 Put the sender's profile picture or uploaded image context here so it displays on the right side
    image: getAbsoluteIconUrl(sender?.profilePic), 

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