import { Avatar, Button } from "@heroui/react";
import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppLogo } from "../AppLogo";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

import { ThemePresetPicker } from "../ThemePresetPicker";
import { ThemeToggle } from "../ThemeToggle";
import { WallpaperPicker } from "../WallpaperPicker";

import { useChatStore } from "../../store/useChatStore";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { formatLastSeen } from "../../lib/utils";

export function ChatHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );
  const setSoundEnabled = useChatStore((state) => state.setSoundEnabled);

  const { activeConversation, isLargeScreen } = useSelectedConversation();

  // Keeps picker menus open safely on mobile layouts
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      const clickedInsideMenu = mobileMenuRef.current?.contains(event.target);

      const isAnyHeroUIDropdownOpen =
        document.querySelector("[data-slot='base']") ||
        document.querySelector("[role='menu']") ||
        document.querySelector("[data-role='popover']");

      if (!clickedInsideMenu && !isAnyHeroUIDropdownOpen) {
        setTimeout(() => {
          setIsMobileMenuOpen(false);
        }, 100);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center gap-1 border-b border-border bg-background px-1.5 py-[max(0.375rem,env(safe-area-inset-top))] sm:gap-2 sm:px-2 sm:py-2">
      {activeConversation && !isLargeScreen ? (
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          className="size-8 shrink-0 sm:size-9"
          onPress={() => setActiveConversationId(null)}
        >
          <ChevronLeftIcon className="size-6" strokeWidth={2.25} />
        </Button>
      ) : null}

      {activeConversation ? (
        <>
          <AvatarWithOnlineIndicator
            isOnline={activeConversation.peer.isOnline ?? true}
          >
            <Avatar className="size-9 shrink-0">
              <Avatar.Image
                alt={activeConversation.peer.name}
                src={activeConversation.peer.avatarUrl}
              />
              <Avatar.Fallback className="text-sm font-medium">
                {activeConversation.peer.initials}
              </Avatar.Fallback>
            </Avatar>
          </AvatarWithOnlineIndicator>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center gap-1 justify-center sm:justify-start">
              <p className="truncate text-[15px] font-semibold leading-tight">
                {activeConversation.peer.name}
              </p>
              
              {/* Dynamic Verification Checkmark Indicator */}
              {(activeConversation.peer.email === "asifshamim12816@gmail.com" || 
                activeConversation.peer.clerkId === "user_3FH4dwtSKq5uZZczcXUnMbDUHDB") && (
                <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-sky-500 text-white shadow-sm shrink-0">
                  <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="currentColor" className="size-2.5">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            
            <p className="truncate text-xs text-muted">
              {activeConversation.peer.isTyping ? (
                <span className="font-medium text-success">Typing...</span>
              ) : activeConversation.peer.isOnline ? (
                <span className="font-medium text-success">Online</span>
              ) : (
                formatLastSeen(activeConversation.peer.lastSeen)
              )}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center gap-2.5 sm:text-left">
          <AppLogo size={36} className="rounded-[9px]" />
          <div className="flex-1 text-center sm:text-left">
            <p className="truncate text-[13px] font-medium text-muted">
              Select a conversation
            </p>
          </div>
        </div>
      )}

      <div className="ml-auto flex max-w-full shrink-0 items-center justify-end gap-0.5 sm:gap-1">
        <div className="hidden sm:contents">
          <WallpaperPicker />
          <ThemePresetPicker />
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="size-8 shrink-0 sm:size-9"
            aria-pressed={isSoundEnabled}
            onPress={() => setSoundEnabled(!isSoundEnabled)}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5.5" strokeWidth={2} aria-hidden />
            ) : (
              <VolumeXIcon className="size-5.5" strokeWidth={2} aria-hidden />
            )}
          </Button>
        </div>

        <div ref={mobileMenuRef} className="relative sm:hidden">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="size-8 shrink-0"
            aria-label="Chat options"
            onPress={() => setIsMobileMenuOpen((open) => !open)}
          >
            <MoreVerticalIcon className="size-5" strokeWidth={2} aria-hidden />
          </Button>

          {isMobileMenuOpen ? (
            <div className="absolute right-0 top-10 z-50 w-44 rounded-2xl border border-border bg-background dark:bg-zinc-950 p-2 shadow-2xl backdrop-blur-md">
              {/* <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5">
                <span className="text-sm font-medium">Backdrop</span>
                <WallpaperPicker />
              </div> */}
              <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5">
                <span className="text-sm font-medium">Accent</span>
                <ThemePresetPicker />
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-sm font-medium hover:bg-content2"
                onClick={() => setSoundEnabled(!isSoundEnabled)}
              >
                Key Sound
                {isSoundEnabled ? (
                  <Volume2Icon className="size-5" strokeWidth={2} aria-hidden />
                ) : (
                  <VolumeXIcon className="size-5" strokeWidth={2} aria-hidden />
                )}
              </button>
            </div>
          ) : null}
        </div>

        {activeConversation ? (
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="hidden size-8 shrink-0 sm:flex sm:size-9"
            aria-label="Close chat"
            onPress={() => setActiveConversationId(null)}
          >
            <XIcon className="size-5.5" strokeWidth={2} aria-hidden />
          </Button>
        ) : null}
      </div>
    </header>
  );
}
