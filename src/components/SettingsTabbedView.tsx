"use client";

import { useState } from "react";
import type { RelationshipStatus, ProfileTheme } from "@/generated/prisma/enums";
import { AvatarUpload } from "./AvatarUpload";
import { EditProfileForm } from "./EditProfileForm";
import { ProfileInterestsEditor } from "./ProfileInterestsEditor";
import { PrivacyVisitsToggle } from "./PrivacyVisitsToggle";
import { LocationPinForm } from "./LocationPinForm";
import { PushNotificationPanel } from "./PushNotificationPanel";
import { ProfileThemePicker } from "./ProfileThemePicker";
import { ShareMatilhaLink } from "./ShareMatilhaLink";
import { GdprExportPanel } from "./GdprExportPanel";
import { FederationPanel } from "./FederationPanel";
import { StoragePanel } from "./StoragePanel";
import { CapacitorNativePanel } from "./CapacitorNativePanel";
import { WebRTCDebugPanel } from "./WebRTCDebugPanel";
import { AppAboutCard } from "./AppAboutCard";

type SettingsTab = "perfil" | "privacidade" | "aparencia" | "avancado";

type SettingsTabbedViewProps = {
  full: {
    name: string;
    username: string;
    bio: string | null;
    email: string;
    avatarUrl: string | null;
    showVisits: boolean;
    profileTheme: ProfileTheme | null;
    locationCity: string | null;
    locationArea: string | null;
    showLocation: boolean;
    birthDate: Date | null;
    relationshipStatus: RelationshipStatus | null;
    interests: string[];
  };
};

export function SettingsTabbedView({ full }: SettingsTabbedViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("perfil");

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: "perfil", label: "Conta & Perfil", icon: "👤" },
    { id: "privacidade", label: "Privacidade", icon: "🔒" },
    { id: "aparencia", label: "Aparência", icon: "🎨" },
    { id: "avancado", label: "Avançado / Servidor", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      {/* Abas de Navegação */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-bc-caramel/20 bg-bc-sand/20 p-1.5 text-xs font-bold">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-xl py-2.5 transition ${
              activeTab === t.id
                ? "bg-bc-white text-bc-blue shadow-xs font-black"
                : "text-bc-brown/70 hover:text-bc-blue"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba 1: Conta & Perfil */}
      {activeTab === "perfil" && (
        <div className="space-y-6 animate-fade-in">
          <AvatarUpload name={full.name} avatarUrl={full.avatarUrl} />
          <EditProfileForm user={full} />
          <ProfileInterestsEditor initialInterests={full.interests} />
        </div>
      )}

      {/* Conteúdo da Aba 2: Privacidade */}
      {activeTab === "privacidade" && (
        <div className="space-y-6 animate-fade-in">
          <LocationPinForm
            initialCity={full.locationCity}
            initialArea={full.locationArea}
            initialShow={full.showLocation}
          />
          <PrivacyVisitsToggle initialShowVisits={full.showVisits} />
          <PushNotificationPanel />
          <GdprExportPanel />
        </div>
      )}

      {/* Conteúdo da Aba 3: Aparência */}
      {activeTab === "aparencia" && (
        <div className="space-y-6 animate-fade-in">
          <ProfileThemePicker initialTheme={full.profileTheme} />
          <ShareMatilhaLink />
        </div>
      )}

      {/* Conteúdo da Aba 4: Avançado / Servidor */}
      {activeTab === "avancado" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-900">
            ℹ️ Configurações técnicas de rede e infraestrutura do servidor Brasil Caramelo.
          </div>
          <FederationPanel />
          <StoragePanel />
          <CapacitorNativePanel />
          <WebRTCDebugPanel />
          <AppAboutCard />
        </div>
      )}
    </div>
  );
}
