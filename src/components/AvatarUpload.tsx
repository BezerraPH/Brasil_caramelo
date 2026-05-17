"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
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
          JPG ou PNG, até 4 MB. Hospedagem via Uploadthing.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <UploadButton
            endpoint="avatar"
            onClientUploadComplete={(res) => {
              const uploaded = res?.[0]?.ufsUrl ?? res?.[0]?.url;
              if (uploaded) {
                setUrl(uploaded);
                setError(null);
                router.refresh();
              }
            }}
            onUploadError={(e) => {
              setError(e.message);
            }}
            appearance={{
              button:
                "bc-btn-primary ut-ready:bg-bc-green ut-uploading:bg-bc-blue/70",
              allowedContent: "text-xs text-bc-brown",
            }}
            content={{
              button: "Enviar foto",
              allowedContent: "Máx. 4MB",
            }}
          />
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>
    </section>
  );
}
