import { useMediaQuery } from "./useMediaQuery";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// John Doe -> JD
export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("");
}

// mapUserToConversation is an adapter — it converts the raw backend shapes (a user document + an array of message documents) into the clean view-model that the chat UI components expect to render.

// Two transformations happen:
// 1. Messages → UI messages
// 2. User → peer

function mapUserToConversation({ user, messages, authUser, onlineUsers }) {
  const rawMessageById = new Map(messages.map((message) => [String(message._id), message]));
  const isVerifiedUser =
    user.email === "asifshamim12816@gmail.com" ||
    user.clerkId === "user_3FH4dwtSKq5uZZczcXUnMbDUHDB" ||
    String(user._id) === "6a32dee03fc89c753bd1b423";

  const getMessageStatus = (message) => {
    if (String(message.senderId) !== String(authUser?._id)) return null;
    if (message.readBy?.some((userId) => String(userId) === String(user._id))) return "read";
    if (message.deliveredTo?.some((userId) => String(userId) === String(user._id))) return "delivered";
    return "sent";
  };

  const mapReplyPreview = (replyTo) => {
    const replyMessage =
      typeof replyTo === "object" && replyTo !== null ? replyTo : rawMessageById.get(String(replyTo));

    if (!replyMessage) return null;

    const hasImage = Boolean(replyMessage.image);
    const hasVideo = Boolean(replyMessage.video);

    return {
      id: replyMessage._id,
      role: String(replyMessage.senderId) === String(authUser?._id) ? "me" : "them",
      text: replyMessage.text || (hasImage ? "Photo" : hasVideo ? "Video" : "Message"),
      imageUrl: replyMessage.image,
      videoUrl: replyMessage.video,
    };
  };

  const mappedMessages = messages.map((message) => ({
    id: message._id,
    role: String(message.senderId) === String(authUser?._id) ? "me" : "them",
    text: message.text || "",
    time: formatMessageTime(message.createdAt),
    status: getMessageStatus(message),
    isEdited: Boolean(message.editedAt),
    imageUrl: message.image,
    videoUrl: message.video,
    replyTo: mapReplyPreview(message.replyTo),
  }));

  return {
    id: user._id,
    peer: {
      name: user.fullName,
      subtitle: user.email,
      isOnline: onlineUsers.includes(user._id),
      isTyping: false,
      lastSeen: user.lastSeen,
      email: user.email,
      clerkId: user.clerkId,
      isVerified: isVerifiedUser,
      avatarUrl: user.profilePic,
      initials: getInitials(user.fullName),
    },
    messages: mappedMessages,
  };
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const messages = useChatStore((state) => state.messages);
  const typingUsers = useChatStore((state) => state.typingUsers);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const selectedUser = activeConversationId
    ? users.find((user) => user._id === activeConversationId) ||
      conversations.find((user) => user._id === activeConversationId)
    : null;

  const activeConversation = selectedUser
    ? mapUserToConversation({ user: selectedUser, messages, authUser, onlineUsers })
    : null;

  if (activeConversation) {
    activeConversation.peer.isTyping = Boolean(typingUsers[activeConversation.id]);
  }

  return {
    activeConversation,
    activeConversationId,
    isLargeScreen,
  };
}
