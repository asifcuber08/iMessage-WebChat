import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";

function ChatPage() {
  const { frameStyle } = useWallpaper();

  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const requestNotificationPermission = useChatStore((state) => state.requestNotificationPermission);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const subscribeToTyping = useChatStore((state) => state.subscribeToTyping);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);
  const unsubscribeFromTyping = useChatStore((state) => state.unsubscribeFromTyping);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const socket = useAuthStore((state) => state.socket);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getUsers();
    getConversations();
    requestNotificationPermission();
  }, [getConversations, getUsers, requestNotificationPermission]);

  useEffect(() => {
    getUsers();
    getConversations();
  }, [getConversations, getUsers, onlineUsers]);

  useEffect(() => {
    if (!socket) return undefined;

    subscribeToMessages();
    subscribeToTyping();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTyping();
    };
  }, [socket, subscribeToMessages, subscribeToTyping, unsubscribeFromMessages, unsubscribeFromTyping]);

  useEffect(() => {
    if (!activeConversationId) return;

    getMessages(activeConversationId);
  }, [getMessages, activeConversationId]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8" style={frameStyle}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
        <ChatSidebar />

        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatHeader />
          <MessageList />

          {activeConversation ? <ChatComposer /> : null}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
