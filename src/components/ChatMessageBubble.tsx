"use client";

import Link from "next/link";
import { BcImage } from "./BcImage";

export type ChatBubbleMessage = {
  id: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentMime?: string | null;
  createdAt: string;
  isMine: boolean;
  sender?: {
    name: string;
    username?: string;
  };
  showSender?: boolean;
};

export function ChatMessageBubble({ message }: { message: ChatBubbleMessage }) {
  const isImage =
    message.attachmentMime?.startsWith("image/") && message.attachmentUrl;

  return (
    <div
      className={`bc-chat-bubble max-w-[85%] px-3 py-2 text-sm ${
        message.isMine ? "bc-chat-bubble--mine" : "bc-chat-bubble--theirs"
      }`}
    >
      {message.showSender && message.sender && (
        <p className="mb-1 text-[10px] font-bold opacity-80">
          {message.sender.name}
        </p>
      )}
      {isImage && message.attachmentUrl && (
        <div className="relative mb-2 aspect-video max-h-48 min-h-[120px] w-full min-w-[180px] overflow-hidden rounded-lg">
          <BcImage
            src={message.attachmentUrl}
            alt="Anexo"
            fill
            sizes="280px"
            className="object-cover"
          />
        </div>
      )}
      {message.attachmentUrl && !isImage && (
        <Link
          href={message.attachmentUrl}
          target="_blank"
          className="mb-2 block rounded-lg bg-black/10 px-2 py-1 text-xs underline"
        >
          📎 Abrir anexo
        </Link>
      )}
      {message.content && (
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      )}
      <time className="mt-1 block text-[10px] opacity-70">
        {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
    </div>
  );
}
