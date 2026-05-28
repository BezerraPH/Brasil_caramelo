"use client";

import { useRef, useState } from "react";

type ChatComposerProps = {
  disabled?: boolean;
  sending?: boolean;
  onSend: (content: string, attachment?: { url: string; mime: string }) => void;
  onTyping?: (isTyping: boolean) => void;
};

export function ChatComposer({
  disabled,
  sending,
  onSend,
  onTyping,
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function notifyTyping(active: boolean) {
    onTyping?.(active);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (active) {
      typingTimeout.current = setTimeout(() => onTyping?.(false), 2500);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "chatAttachment");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        onSend("", { url: data.url, mime: data.mime });
        onTyping?.(false);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    onTyping?.(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-bc-blue/10 p-3"
    >
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadFile(f);
          }}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          className="bc-btn-ghost shrink-0 px-2"
          title="Anexar imagem ou PDF"
        >
          {uploading ? "…" : "📎"}
        </button>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            notifyTyping(e.target.value.length > 0);
          }}
          onBlur={() => onTyping?.(false)}
          placeholder="Escreva uma mensagem…"
          maxLength={2000}
          className="bc-input flex-1"
          disabled={disabled || sending || uploading}
        />
        <button
          type="submit"
          disabled={disabled || sending || uploading || !text.trim()}
          className="bc-btn-primary shrink-0"
        >
          {sending ? "…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
