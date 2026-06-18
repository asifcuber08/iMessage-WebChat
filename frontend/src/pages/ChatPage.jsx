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
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId); 
  
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const socket = useAuthStore((state) => state.socket);

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  // Mobile Hardware Back Button Router Hijack
  useEffect(() => {
    if (isLargeScreen) return undefined;

    if (activeConversationId) {
      window.history.pushState({ chatActive: true }, "");

      const handlePopState = (event) => {
        event.preventDefault();
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
      /* 🔒 LOCKED VIEWPORT: Uses fixed position combined with h-[100dvh] ONLY inside the chat workspace container.
         This blocks the chat page from jumping or scrolling out of alignment when keyboards trigger */
      className="fixed inset-0 h-[100dvh] w-screen flex flex-col overflow-hidden p-0 sm:p-3 md:p-8 select-none"
      style={frameStyle}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-1 overflow-hidden border border-border bg-background text-foreground sm:rounded-2xl">
        <ChatSidebar />

        <div
          className={`h-full flex-1 flex-col overflow-hidden relative ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeConversationId ? (
            <div className="flex flex-col h-full w-full overflow-hidden relative">
              <ChatHeader />
              <MessageList />
              {activeConversation ? <ChatComposer /> : null}
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-content1/10 text-muted text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
