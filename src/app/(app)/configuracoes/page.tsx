import Link from "next/link";
import { Suspense } from "react";
import { SettingsTabbedView } from "@/components/SettingsTabbedView";
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
      birthDate: true,
      relationshipStatus: true,
      interests: true,
    },
  });

  if (!full) return null;

  return (
    <PageContainer narrow>
      <header className="bc-page-header bc-animate-in mb-6">
        <Link
          href={`/perfil/${user.username}`}
          className="text-xs font-bold text-bc-blue hover:underline"
        >
          ← Voltar ao meu perfil
        </Link>
        <h1 className="mt-2 text-2xl font-black text-bc-blue sm:text-3xl">
          Configurações da Conta
        </h1>
        <p className="mt-1 text-xs font-semibold text-bc-brown">
          Gerencie suas informações pessoais, privacidade e preferências da matilha
        </p>
      </header>

      <Suspense fallback={<div className="py-8 text-center text-xs font-semibold text-bc-brown animate-pulse">Carregando configurações...</div>}>
        <SettingsTabbedView full={full} />
      </Suspense>

      <p className="mt-6 text-center text-xs font-medium text-bc-brown/70">
        E-mail da conta: <strong>{full.email}</strong>
      </p>
    </PageContainer>
  );
}
