import Link from "next/link";
import { FlashEventBanner } from "@/components/FlashEventBanner";
import { PageContainer } from "@/components/PageContainer";
import { RolezinhoPanel } from "@/components/RolezinhoPanel";
import { getCurrentUser } from "@/lib/auth";
import { getActiveFlashEvent } from "@/lib/events";

export default async function RolezinhoPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const event = await getActiveFlashEvent(user.id);

  return (
    <PageContainer narrow>
      <header className="mb-6 text-center bc-animate-in">
        <h1 className="text-3xl font-bold text-bc-blue">O Grande Rolezinho</h1>
        <p className="mt-2 text-bc-brown">
          Eventos flash com moedas em dobro e notificação para toda a matilha
        </p>
      </header>

      {event ? (
        <FlashEventBanner
          title={event.title}
          message={event.message}
          coinMultiplier={event.coinMultiplier}
          endsAt={event.endsAt.toISOString()}
        />
      ) : (
        <p className="bc-card mb-6 p-6 text-center text-bc-brown">
          Nenhum rolezinho ativo no momento. Fique de olho no sino 🔔
        </p>
      )}

      <RolezinhoPanel isPremium={user.isPremium} />

      <p className="mt-6 text-center text-xs text-bc-brown">
        <Link href="/premium" className="text-bc-gold hover:underline">
          Seja Pedigree
        </Link>{" "}
        para iniciar rolezinhos
      </p>
    </PageContainer>
  );
}
