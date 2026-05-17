"use client";

import { useRef, useState } from "react";
import type { UploadKind } from "@/lib/storage";

type LocalMediaUploadProps = {
  kind: UploadKind;
  accept: string;
  label: string;
  className?: string;
  disabled?: boolean;
  onUploaded: (url: string, mime: string) => void;
  onError?: (message: string) => void;
};

export function LocalMediaUpload({
  kind,
  accept,
  label,
  className,
  disabled,
  onUploaded,
  onError,
}: LocalMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        onError?.(data.error ?? "Falha no envio.");
        return;
      }
      onUploaded(data.url, data.mime);
    } catch {
      onError?.("Erro de rede ao enviar o arquivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        {uploading ? "Enviando…" : label}
      </button>
    </>
  );
}
