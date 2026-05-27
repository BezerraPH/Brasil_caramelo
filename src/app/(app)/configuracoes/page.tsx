import Link from "next/link";
import { AppAboutCard } from "@/components/AppAboutCard";
import { ShareMatilhaLink } from "@/components/ShareMatilhaLink";
import { GuardDogAssistant } from "@/components/GuardDogAssistant";
import { FederationPanel } from "@/components/FederationPanel";
import { AvatarUpload } from "@/components/AvatarUpload";
import { StoragePanel } from "@/components/StoragePanel";
import { ProfileThemePicker } from "@/components/ProfileThemePicker";
import { PrivacyVisitsToggle } from "@/components/PrivacyVisitsToggle";
import { LocationPinForm } from "@/components/LocationPinForm";
import { EditProfileForm } from "@/components/EditProfileForm";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      username: true,
      bio: true,
      email: true,
      avatarUrl: true,
      showVisits: true,
      profileTheme: true,
      locationCity: true,
      locationArea: true,
      showLocation: true,
    },
  });

  if (!full) return null;

  return (
    <PageContainer narrow>
      <header className="bc-page-header bc-animate-in mb-6">
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
      </header>

      <ShareMatilhaLink className="mb-6" />
      <LocationPinForm
        initialCity={full.locationCity}
        initialArea={full.locationArea}
        initialShow={full.showLocation}
      />
      <PrivacyVisitsToggle initialShowVisits={full.showVisits} />
      <ProfileThemePicker initialTheme={full.profileTheme} />
      <StoragePanel />
      <AvatarUpload name={full.name} avatarUrl={full.avatarUrl} />
      <EditProfileForm user={full} />

      <FederationPanel />
      <GuardDogAssistant />
      <AppAboutCard />

      <p className="mt-4 text-center text-xs text-bc-brown/70">
        E-mail da conta: {full.email}
      </p>
    </PageContainer>
  );
}
