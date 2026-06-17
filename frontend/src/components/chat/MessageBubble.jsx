import { Button } from "@heroui/react";
import { CornerUpLeftIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";

// Compress + size images for the bubble (q-auto works for images; f-auto picks WebP/AVIF).
const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function MessageBubble({ message, onDelete, onReply, onJumpToReply, isHighlighted }) {
  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const touchStartRef = useRef(null);
  const didSwipeRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleReply = () => onReply?.(message);
  const handleDelete = () => onDelete?.(message);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    didSwipeRef.current = false;
  };

  const handleTouchMove = (event) => {
    if (!touchStartRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
      didSwipeRef.current = deltaX > 12;
      setDragOffset(Math.min(deltaX, 72));
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 52) handleReply();
    touchStartRef.current = null;
    window.setTimeout(() => {
      didSwipeRef.current = false;
    }, 0);
    setDragOffset(0);
  };

  const actionMenu = (
    <div className={`relative mb-1 flex sm:hidden ${isOwnMessage ? "order-first" : "order-last"}`}>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        className="size-7"
        aria-label="Message actions"
        onPress={() => setIsMenuOpen((open) => !open)}
      >
        <MoreVerticalIcon className="size-4" strokeWidth={2} />
      </Button>
      {isMenuOpen ? (
        <div
          className={`absolute bottom-8 z-20 min-w-28 rounded-xl border border-border bg-background p-1 shadow-xl ${
            isOwnMessage ? "right-0" : "left-0"
          }`}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface"
            onClick={() => {
              setIsMenuOpen(false);
              handleReply();
            }}
          >
            <CornerUpLeftIcon className="size-4" strokeWidth={2} />
            Reply
          </button>
          {isOwnMessage ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-danger hover:bg-surface"
              onClick={() => {
                setIsMenuOpen(false);
                handleDelete();
              }}
            >
              <Trash2Icon className="size-4" strokeWidth={2} />
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={`group flex w-full items-end gap-1.5 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {actionMenu}
      {isOwnMessage ? (
        <div className="mb-1 hidden opacity-100 transition-opacity sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="size-7"
            aria-label="Delete message for everyone"
            onPress={handleDelete}
          >
            <Trash2Icon className="size-4" strokeWidth={2} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="size-7"
            aria-label="Reply to message"
            onPress={handleReply}
          >
            <CornerUpLeftIcon className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : null}
      <div
        role="button"
        tabIndex={0}
        aria-label="Select message to reply"
        onClick={() => {
          if (!didSwipeRef.current) handleReply();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleReply();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: dragOffset ? `translateX(${dragOffset}px)` : undefined }}
        className={`max-w-[min(86%,28rem)] rounded-2xl px-3 py-2 text-[15px] leading-snug transition-[background-color,box-shadow,transform] sm:max-w-[min(75%,28rem)] sm:px-3.5 ${
          isOwnMessage
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-surface"
        } ${isHighlighted ? "ring-2 ring-warning ring-offset-2 ring-offset-background" : ""}`}
      >
        {message.replyTo ? (
          <div
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onJumpToReply?.(message.replyTo.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onJumpToReply?.(message.replyTo.id);
              }
            }}
            className={`mb-1.5 border-l-2 py-1 pl-2 text-xs ${
              isOwnMessage ? "border-accent-foreground/65 bg-white/10" : "border-accent bg-black/5"
            } rounded-r-md`}
          >
            <p className="mb-0.5 font-semibold">{message.replyTo.role === "me" ? "You" : "Them"}</p>
            <p className="line-clamp-2 wrap-break-word opacity-80">{message.replyTo.text}</p>
          </div>
        ) : null}
        {hasImage ? (
          <img
            src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
            alt=""
            className="mb-1.5 max-h-40 max-w-full rounded-lg object-cover sm:max-h-52 sm:rounded-xl"
          />
        ) : null}
        {hasVideo ? <MessageVideo src={message.videoUrl} /> : null}
        {message.text ? (
          <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
        ) : null}
        <p
          className={`mt-1 text-[11px] tabular-nums ${
            isOwnMessage ? "text-accent-foreground/75" : "text-muted"
          }`}
        >
          {message.time}
        </p>
      </div>
      {!isOwnMessage ? (
        <div className="mb-1 hidden opacity-100 transition-opacity sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="size-7"
            aria-label="Reply to message"
            onPress={handleReply}
          >
              <CornerUpLeftIcon className="size-4" strokeWidth={2} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
