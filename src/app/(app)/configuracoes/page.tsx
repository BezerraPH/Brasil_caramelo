import Link from "next/link";
import { AvatarUpload } from "@/components/AvatarUpload";
import { UploadSetupBanner } from "@/components/UploadSetupBanner";
import { EditProfileForm } from "@/components/EditProfileForm";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, username: true, bio: true, email: true, avatarUrl: true },
  });

  if (!full) return null;

  return (
    <PageContainer narrow>
      <UploadSetupBanner />
      <div className="mb-6">
        <Link
          href={`/perfil/${user.username}`}
          className="text-sm text-bc-blue hover:underline"
        >
          ← Voltar ao perfil
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-bc-blue">Editar perfil</h1>
        <p className="text-sm text-bc-brown">
          Atualize como você aparece no Brasil Caramelo.
        </p>
      </div>

      <AvatarUpload name={full.name} avatarUrl={full.avatarUrl} />
      <EditProfileForm user={full} />

      <p className="mt-4 text-center text-xs text-bc-brown/70">
        E-mail da conta: {full.email}
      </p>
    </PageContainer>
  );
}
