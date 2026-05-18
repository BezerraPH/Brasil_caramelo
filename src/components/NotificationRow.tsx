"use client";

import Link from "next/link";
import type { NotificationType } from "@/generated/prisma/enums";
import {
  formatRelativeTime,
  notificationIcon,
} from "@/lib/notification-ui";

export type NotificationRowData = {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationRowProps = {
  item: NotificationRowData;
  compact?: boolean;
  onNavigate?: () => void;
  onMarkRead?: (id: string) => void;
};

export function NotificationRow({
  item,
  compact,
  onNavigate,
  onMarkRead,
}: NotificationRowProps) {
  const icon = notificationIcon(item.type);
  const time = formatRelativeTime(item.createdAt);

  const body = (
    <>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bc-blue/10 text-lg"
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block ${compact ? "text-sm" : "text-sm leading-snug"} ${
            item.read ? "text-bc-brown" : "font-medium text-bc-blue"
          }`}
        >
          {item.message}
        </span>
        <time className="mt-0.5 block text-[10px] text-bc-brown/70">
          {time}
        </time>
      </span>
    </>
  );

  const className = `flex items-start gap-3 rounded-xl px-2 py-2 transition hover:bg-bc-green/8 ${
    item.read ? "" : "bg-bc-blue/5"
  }`;

  function handleClick() {
    if (!item.read) onMarkRead?.(item.id);
    onNavigate?.();
  }

  if (item.link) {
    return (
      <Link href={item.link} onClick={handleClick} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <div className={className} role="listitem">
      {body}
    </div>
  );
}
