import { Button, TextArea } from "@heroui/react";
import { ImageIcon, LoaderIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";

export function ChatComposer() {
  const composerText = useChatStore((state) => state.composerText);
  const replyingTo = useChatStore((state) => state.replyingTo);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const clearReplyingTo = useChatStore((state) => state.clearReplyingTo);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const startTyping = useChatStore((state) => state.startTyping);
  const stopTyping = useChatStore((state) => state.stopTyping);
  const { activeConversationId } = useSelectedConversation();
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const composerRootRef = useRef(null);
  const mediaInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [pickedMedia, setPickedMedia] = useState(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (pickedMedia?.previewUrl) URL.revokeObjectURL(pickedMedia.previewUrl);
    };
  }, [pickedMedia]);

  useEffect(() => {
    if (!activeConversationId) return undefined;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping(activeConversationId);
    };
  }, [activeConversationId, stopTyping]);

  const playSoundIfEnabled = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const focusComposer = () => {
    composerRootRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
  };

  const handleSend = async () => {
    const didSendMessage = pickedMedia
      ? await sendMediaMessage({
          conversationId: activeConversationId,
          file: pickedMedia.file,
          text: composerText,
        })
      : await sendTextMessage(activeConversationId);

    if (didSendMessage && pickedMedia?.previewUrl) {
      URL.revokeObjectURL(pickedMedia.previewUrl);
      setPickedMedia(null);
    }

    if (didSendMessage) playSoundIfEnabled();
    requestAnimationFrame(focusComposer);
  };

  const handleComposerTextChange = (event) => {
    const nextText = event.target.value;
    setComposerText(nextText);
    playSoundIfEnabled();

    if (!activeConversationId) return;

    if (nextText.trim()) {
      startTyping(activeConversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activeConversationId);
      }, 2000);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping(activeConversationId);
    }
  };

  const handleMediaPick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (pickedMedia?.previewUrl) URL.revokeObjectURL(pickedMedia.previewUrl);

    setPickedMedia({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    });
  };

  const clearPickedMedia = () => {
    if (pickedMedia?.previewUrl) URL.revokeObjectURL(pickedMedia.previewUrl);
    setPickedMedia(null);
  };

  return (
    <footer
      ref={composerRootRef}
      className="shrink-0 border-t border-border px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-2"
    >
      {replyingTo ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
          <div className="min-w-0 flex-1 border-l-2 border-accent pl-2">
            <p className="text-xs font-semibold text-accent">
              Replying to {replyingTo.role === "me" ? "your message" : "message"}
            </p>
            <p className="truncate text-xs text-muted">{replyingTo.text || "Media"}</p>
          </div>
          <Button variant="ghost" size="sm" isIconOnly onPress={clearReplyingTo}>
            <XIcon className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : null}
      {pickedMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
          {pickedMedia.type === "image" ? (
            <img
              src={pickedMedia.previewUrl}
              alt=""
              className="size-16 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <video
              src={pickedMedia.previewUrl}
              className="size-16 shrink-0 rounded-lg object-cover"
              muted
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{pickedMedia.file.name}</p>
            <p className="text-xs text-muted">Add a caption below, then send.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            isDisabled={isSendingMedia}
            onPress={clearPickedMedia}
          >
            <XIcon className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : null}
      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon
            className="size-4 shrink-0 animate-spin text-accent"
            strokeWidth={2}
            aria-hidden
          />
          <span className="truncate">Uploading media...</span>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          className="size-9 shrink-0 touch-manipulation self-end text-accent"
          onPress={() => mediaInputRef.current?.click()}
        >
          <ImageIcon className="size-5 sm:size-6" strokeWidth={2} />
        </Button>
        <TextArea
          fullWidth
          variant="secondary"
          placeholder="iMessage"
          rows={1}
          value={composerText}
          onChange={handleComposerTextChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 rounded-full"
        />

        <Button
          variant="primary"
          isIconOnly
          isDisabled={isSendingMedia || (!composerText.trim() && !pickedMedia)}
          onMouseDown={(event) => event.preventDefault()}
          onPress={handleSend}
        >
          <SendHorizontalIcon className="size-5" />
        </Button>
      </div>
    </footer>
  );
}
