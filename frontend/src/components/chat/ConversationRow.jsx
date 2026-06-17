import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

export function ConversationRow({ user, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left ${
        selected ? "bg-accent-soft" : ""
      }`}
    >
      <AvatarWithOnlineIndicator isOnline={user.isOnline ?? true}>
        <Avatar className="size-12 shrink-0">
          <Avatar.Image alt={user.name} src={user.avatarUrl} />
          <Avatar.Fallback className="text-sm font-medium">{user.initials}</Avatar.Fallback>
        </Avatar>
      </AvatarWithOnlineIndicator>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{user.name}</p>
          {user.lastMessageTime ? (
            <span
              className={`shrink-0 text-[11px] tabular-nums ${
                user.unreadCount ? "font-semibold text-accent" : "text-muted"
              }`}
            >
              {user.lastMessageTime}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-2">
          <p
            className={`min-w-0 flex-1 truncate text-sm ${
              user.unreadCount ? "font-semibold text-foreground" : "text-muted"
            }`}
          >
            {user.lastMessagePreview || (user.isOnline ? "Online" : "Tap to start chatting")}
          </p>
          {user.unreadCount ? (
            <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-accent-foreground">
              {user.unreadCount > 99 ? "99+" : user.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
