import { Button } from "@heroui/react";
import { CornerUpLeftIcon, Trash2Icon } from "lucide-react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";

// Compress + size images for the bubble (q-auto works for images; f-auto picks WebP/AVIF).
const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function MessageBubble({ message, onDelete, onReply }) {
  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);

  const handleReply = () => onReply?.(message);
  const handleDelete = () => onDelete?.(message.id);

  return (
    <div
      className={`group flex w-full items-end gap-1.5 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {isOwnMessage ? (
        <div className="mb-1 flex opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
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
        onClick={handleReply}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleReply();
          }
        }}
        className={`max-w-[min(90%,28rem)] rounded-2xl px-3 py-2 text-[15px] leading-snug sm:max-w-[min(75%,28rem)] sm:px-3.5 ${
          isOwnMessage
            ? "rounded-br-md bg-accent text-accent-foreground"
            : "rounded-bl-md bg-surface"
        }`}
      >
        {message.replyTo ? (
          <div
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
        <div className="mb-1 flex opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
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
        </div>
      ) : null}
    </div>
  );
}
