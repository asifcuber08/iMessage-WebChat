export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatConversationTime(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();

  if (isToday) return formatMessageTime(date);

  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function formatLastSeen(date) {
  if (!date) return "Offline";

  const lastSeenDate = new Date(date);
  const diffSeconds = Math.max(0, Math.floor((Date.now() - lastSeenDate.getTime()) / 1000));

  if (diffSeconds < 5) return "Last seen just now";
  if (diffSeconds < 60) return `Last seen ${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;

  return `Last seen ${lastSeenDate.toLocaleDateString([], { month: "short", day: "numeric" })}`;
}

export function getMessagePreview(message, currentUserId) {
  if (!message) return "";

  const prefix = String(message.senderId) === String(currentUserId) ? "You: " : "";

  if (message.text) return `${prefix}${message.text}`;
  if (message.image) return `${prefix}Photo`;
  if (message.video) return `${prefix}Video`;

  return `${prefix}Message`;
}
