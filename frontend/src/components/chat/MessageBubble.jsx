import { Button } from "@heroui/react";
import {
  CheckCheckIcon,
  CheckIcon,
  CornerUpLeftIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";

// Compress + size images for the bubble (q-auto works for images; f-auto picks WebP/AVIF).
const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function MessageBubble({
  message,
  onDelete,
  onEdit,
  onMenuOpenChange,
  onReply,
  onJumpToReply,
  isAnyMenuOpen,
  isHighlighted,
  isMenuOpen,
}) {
  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const touchStartRef = useRef(null);
  const didSwipeRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleReply = () => onReply?.(message);
  const handleDelete = () => onDelete?.(message);
  const handleEdit = () => onEdit?.(message);

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

    // Two-way mobile swiping logic (Horizontal movement tracking inside bubble card)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (isOwnMessage && deltaX < 0) {
        // Swipe LEFT (negative deltaX) to reply to your own messages
        didSwipeRef.current = Math.abs(deltaX) > 12;
        setDragOffset(Math.max(deltaX, -72)); // Negative shifts layout left
      } else if (!isOwnMessage && deltaX > 0) {
        // Swipe RIGHT (positive deltaX) to reply to incoming messages
        didSwipeRef.current = deltaX > 12;
        setDragOffset(Math.min(deltaX, 72)); // Positive shifts layout right
      }
    }
  };

  const handleTouchMoveEnd = () => {
    // Fire reply context if swiped far enough past threshold in either direction
    if (Math.abs(dragOffset) > 52) handleReply();
    touchStartRef.current = null;
    window.setTimeout(() => {
      didSwipeRef.current = false;
    }, 0);
    setDragOffset(0);
  };

  // Close custom drop menu if user clicks outside the message element area
  const menuRef = useRef(null);
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onMenuOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onMenuOpenChange]);

  const statusIcon =
    message.status === "read" ? (
      <CheckCheckIcon className="size-3.5 text-sky-300" strokeWidth={2.5} aria-label="Seen" />
    ) : message.status === "delivered" ? (
      <CheckCheckIcon className="size-3.5" strokeWidth={2.5} aria-label="Delivered" />
    ) : message.status === "sent" ? (
      <CheckIcon className="size-3.5" strokeWidth={2.5} aria-label="Sent" />
    ) : null;

  return (
    <div
      className={`group flex w-full items-end gap-1.5 px-2 sm:px-4 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Select message to reply"
        onClick={() => {
          // Tap reply still works perfectly as long as user didn't drag/swipe
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
        onTouchEnd={handleTouchMoveEnd}
        style={{ transform: dragOffset ? `translateX(${dragOffset}px)` : undefined }}
        className={`relative min-w-[90px] max-w-[min(86%,28rem)] rounded-2xl px-3 pb-1.5 pt-2 text-[15px] leading-snug transition-[background-color,box-shadow,transform] sm:max-w-[min(75%,28rem)] sm:px-3.5 ${
          isOwnMessage
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-surface"
        } ${isHighlighted ? "ring-2 ring-warning ring-offset-2 ring-offset-background" : ""}`}
      >
        {/* Actions Dropdown Menu sitting INSIDE the bubble layout framework */}
        <div
          ref={menuRef}
          className={`absolute right-1.5 top-1.5 z-30 transition-opacity duration-150 ${
            isAnyMenuOpen && !isMenuOpen
              ? "pointer-events-none opacity-0"
              : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-45"
          }`}
        >
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="size-6 min-w-6 text-current opacity-60 hover:opacity-100 rounded-full bg-black/5 dark:bg-white/5"
            aria-label="Message options"
            onClick={(e) => {
              e.stopPropagation(); // Stops main bubble tap trigger from firing code
              onMenuOpenChange?.(!isMenuOpen);
            }}
          >
            <MoreVerticalIcon className="size-3.5" strokeWidth={2.5} />
          </Button>

          {isMenuOpen ? (
            <div
              className={`pointer-events-auto absolute top-7 z-50 min-w-36 max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-white p-1 text-foreground shadow-2xl dark:bg-zinc-950 ${
                isOwnMessage ? "right-0" : "left-0"
              }`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium hover:bg-content2"
                onClick={() => {
                  onMenuOpenChange?.(false);
                  handleReply();
                }}
              >
                <CornerUpLeftIcon className="size-3.5" strokeWidth={2} />
                Reply
              </button>
              
              {isOwnMessage ? (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium hover:bg-content2"
                    onClick={() => {
                      onMenuOpenChange?.(false);
                      handleEdit();
                    }}
                  >
                    <PencilIcon className="size-3.5" strokeWidth={2} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-danger hover:bg-danger-50"
                    onClick={() => {
                      onMenuOpenChange?.(false);
                      handleDelete();
                    }}
                  >
                    <Trash2Icon className="size-3.5" strokeWidth={2} />
                    for Everyone
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Reply Preview Header box */}
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

        {/* Image Attachments */}
        {hasImage ? (
          <img
            src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
            alt=""
            className="mb-1.5 max-h-40 max-w-full rounded-lg object-cover sm:max-h-52 sm:rounded-xl"
          />
        ) : null}
        
        {/* Video Attachments */}
        {hasVideo ? <MessageVideo src={message.videoUrl} /> : null}

        {/* Message Text Paragraph */}
        {message.text ? (
          <p className="whitespace-pre-wrap wrap-break-word pr-4">{message.text}</p>
        ) : null}

        {/* Timestamp */}
        <p
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums ${
            isOwnMessage ? "text-accent-foreground/75" : "text-muted"
          }`}
        >
          <span>{message.time}{message.isEdited ? " edited" : ""}</span>
          {statusIcon}
        </p>
      </div>
    </div>
  );
}
