"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocalMediaUpload } from "./LocalMediaUpload";
import { UserAvatar } from "./UserAvatar";

type AvatarUploadProps = {
  name: string;
  avatarUrl: string | null;
};

export function AvatarUpload({ name, avatarUrl }: AvatarUploadProps) {
  const router = useRouter();
  const [url, setUrl] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="bc-card mb-6 flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
      <UserAvatar name={name} avatarUrl={url} size="lg" />
      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-semibold text-bc-blue">Foto de perfil</h2>
        <p className="mt-1 text-xs text-bc-brown">
          JPG, PNG ou WebP até 4 MB — armazenado no seu servidor.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <LocalMediaUpload
            kind="avatar"
            accept="image/jpeg,image/png,image/webp,image/gif"
            label="Enviar foto"
            className="bc-btn-primary"
            onUploaded={(uploaded) => {
              setUrl(uploaded);
              setError(null);
              router.refresh();
            }}
            onError={setError}
          />
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </section>
  );
}
