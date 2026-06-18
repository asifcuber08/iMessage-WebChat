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
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId); // 🌟 Added setter action
  
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const socket = useAuthStore((state) => state.socket);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  // 🌟 NEW: Mobile Hardware Back Button Router Hijack
  useEffect(() => {
    // We only want this routing behavior running on small mobile screens
    if (isLargeScreen) return undefined;

    if (activeConversationId) {
      // 1. Push a dummy navigation state into the history stack when a chat opens
      window.history.pushState({ chatActive: true }, "");

      // 2. Intercept the hardware / gesture popstate back button trigger
      const handlePopState = (event) => {
        event.preventDefault();
        // Reset the active conversation back to null to slide back to the user list row sidebar
        setActiveConversationId(null);
      };

      window.addEventListener("popstate", handlePopState);
      
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [activeConversationId, isLargeScreen, setActiveConversationId]);

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
    <div
      className="fixed inset-0 flex flex-col overflow-hidden p-0 sm:p-3 md:p-8"
      style={frameStyle}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 overflow-hidden border border-border bg-background text-foreground sm:rounded-2xl">
        <ChatSidebar />

        <div
          className={`min-h-0 relative flex-1 flex-col overflow-hidden ${
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
