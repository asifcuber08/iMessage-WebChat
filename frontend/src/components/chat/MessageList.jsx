import { LoaderIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import useScrollToBottom from "../../hooks/useScrollToBottom";
import { MessageBubble } from "./MessageBubble";
import { NoConversationPlaceholder } from "./NoConversationPlaceholder";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";

export function MessageList() {
  const { activeConversation, activeConversationId } =
    useSelectedConversation();
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const editMessage = useChatStore((state) => state.editMessage);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const messageRefs = useRef(new Map());
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const lastMessageId = activeConversation?.messages.at(-1)?.id;
  const messagesScrollRef = useScrollToBottom(
    activeConversationId,
    lastMessageId,
  );

  const setMessageRef = useCallback((messageId, node) => {
    if (node) messageRefs.current.set(String(messageId), node);
    else messageRefs.current.delete(String(messageId));
  }, []);

  const handleDelete = async (message) => {
    if (message.role !== "me") return;
    const shouldDelete = window.confirm("Delete this message for everyone?");
    if (!shouldDelete) return;

    await deleteMessage(message.id);
  };

  const handleEdit = async (message) => {
    if (message.role !== "me") return;
    const nextText = window.prompt("Edit message", message.text);
    if (nextText === null) return;
    const trimmedText = nextText.trim();
    if (!trimmedText || trimmedText === message.text) return;

    await editMessage(message.id, trimmedText);
  };

  const handleJumpToReply = (messageId) => {
    const target = messageRefs.current.get(String(messageId));
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedMessageId(String(messageId));
    window.setTimeout(() => setHighlightedMessageId(null), 1600);
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden w-full h-full">
      {activeConversation ? (
        <div
          ref={messagesScrollRef}
          /* 🟢 REVERTED: Restored original text-padding presets so messages look perfect */
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
        >
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            Today
          </p>
          {activeConversation.messages.map((message) => (
            <div
              key={message.id}
              ref={(node) => setMessageRef(message.id, node)}
            >
              <MessageBubble
                message={message}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onReply={setReplyingTo}
                onJumpToReply={handleJumpToReply}
                isHighlighted={highlightedMessageId === String(message.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
      {activeConversation && isMessagesLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/55 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-lg">
            <LoaderIcon
              className="size-4 animate-spin text-accent"
              strokeWidth={2}
            />
            Loading messages
          </div>
        </div>
      ) : null}
    </div>
  );
}
