import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      replyingTo: null,
      typingUsers: {},
      isSoundEnabled: true,
      isSendingMedia: false,
      hasRequestedNotifications: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
          get().getConversations();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages, replyingTo } = get();
        if (!selectedUser) return false;

        try {
          if (replyingTo) {
            if (messageData instanceof FormData) {
              messageData.append("replyTo", replyingTo.id);
            } else {
              messageData = { ...messageData, replyTo: replyingTo.id };
            }
          }

          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          set({ messages: [...messages, res.data], composerText: "", replyingTo: null });
          get().stopTyping(selectedUser._id);
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
          const { activeConversationId, messages } = get();
          const senderId = String(newMessage.senderId);
          const isOpenConversation = String(activeConversationId) === senderId;

          if (isOpenConversation) {
            set({ messages: [...messages, newMessage] });
            axiosInstance.get(`/messages/${senderId}`).then((res) => {
              set({ messages: res.data });
              get().getConversations();
            });
          } else {
            get().showBrowserNotification(newMessage);
            get().getConversations();
          }

          set((state) => ({
            typingUsers: { ...state.typingUsers, [newMessage.senderId]: false },
          }));
        });

        socket.off("messageDeleted");
        socket.on("messageDeleted", ({ messageId, senderId, receiverId }) => {
          set((state) => ({
            messages: state.messages.filter((message) => String(message._id) !== String(messageId)),
            typingUsers: { ...state.typingUsers, [senderId]: false, [receiverId]: false },
          }));
          get().getConversations();
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("messageDeleted");
      },

      subscribeToTyping: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("userTyping");
        socket.on("userTyping", ({ senderId, isTyping }) => {
          if (!senderId) return;

          set((state) => ({
            typingUsers: { ...state.typingUsers, [senderId]: Boolean(isTyping) },
          }));
        });
      },

      unsubscribeFromTyping: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("userTyping");
        set({ typingUsers: {} });
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
        }));
      },

      deleteMessage: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}`);
          set((state) => ({
            messages: state.messages.filter((message) => String(message._id) !== String(messageId)),
          }));
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete message");
          return false;
        }
      },

      requestNotificationPermission: async () => {
        if (!("Notification" in window) || Notification.permission !== "default") return;
        if (get().hasRequestedNotifications) return;

        set({ hasRequestedNotifications: true });
        try {
          await Notification.requestPermission();
        } catch {
          // The browser can block permission prompts until a user gesture.
        }
      },

      showBrowserNotification: (message) => {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        if (document.visibilityState === "visible") return;

        const sender =
          get().users.find((user) => String(user._id) === String(message.senderId)) ||
          get().conversations.find((user) => String(user._id) === String(message.senderId));
        const title = sender?.fullName || "New message";
        const body = message.text || (message.image ? "Photo" : message.video ? "Video" : "Message");

        const fallbackNotification = () => new Notification(title, { body, icon: "/logo.png" });

        if (!navigator.serviceWorker?.ready) {
          fallbackNotification();
          return;
        }

        navigator.serviceWorker.ready
          .then((registration) =>
            registration.showNotification(title, {
              body,
              icon: "/logo.png",
              badge: "/favicon.svg",
              tag: `message-${message.senderId}`,
              data: { url: "/" },
            }),
          )
          .catch(fallbackNotification);
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setReplyingTo: (replyingTo) => set({ replyingTo }),
      clearReplyingTo: () => set({ replyingTo: null }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      startTyping: (conversationId) => {
        const socket = useAuthStore.getState().socket;
        if (!socket || !conversationId) return;

        socket.emit("typing:start", { receiverId: conversationId });
      },

      stopTyping: (conversationId) => {
        const socket = useAuthStore.getState().socket;
        if (!socket || !conversationId) return;

        socket.emit("typing:stop", { receiverId: conversationId });
      },

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file, text }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);
        if (text?.trim()) formData.append("text", text.trim());

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "imessage-storage",
      partialize: (state) => ({
        hasRequestedNotifications: state.hasRequestedNotifications,
        isSoundEnabled: state.isSoundEnabled,
      }),
    },
  ),
);
