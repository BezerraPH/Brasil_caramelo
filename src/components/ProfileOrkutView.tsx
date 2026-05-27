import Link from "next/link";
import type { ReactNode } from "react";
import type { RelationshipStatus } from "@/generated/prisma/enums";
import type { CarameloTierInfo } from "@/lib/caramelo-tier";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfileBioRich } from "@/components/ProfileBioRich";
import { ProfilePersonalInfo } from "@/components/ProfilePersonalInfo";
import { ProfileInterestsTags } from "@/components/ProfileInterestsTags";
import { ProfileOrkutSidebarMenu } from "@/components/ProfileOrkutSidebarMenu";
import { ProfileOrkutFriendsPanel } from "@/components/ProfileOrkutFriendsPanel";
import { CarameloRadarBadge } from "@/components/CarameloRadarBadge";
import { CarameloVerificadoBadge } from "@/components/CarameloVerificadoBadge";
import { FoundingMemberBadge } from "@/components/FoundingMemberBadge";
import { PatioKingBadge } from "@/components/PatioKingBadge";
import { CopyProfileLink } from "@/components/CopyProfileLink";

type FriendMini = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

type ProfileOrkutViewProps = {
  profile: {
    id: string;
    name: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    birthDate: Date | null;
    relationshipStatus: RelationshipStatus | null;
    locationCity: string | null;
    locationArea: string | null;
    showLocation: boolean;
    interests: string[];
    isFoundingMember: boolean;
    biscuitBalance: number;
    isPremium: boolean;
    createdAt: Date;
  };
  isOwnProfile: boolean;
  isFriend: boolean;
  friendCount: number;
  friends: FriendMini[];
  pendingFriends: number;
  carameloTier: CarameloTierInfo;
  showKing: boolean;
  accentColor: string;
  centerContent: ReactNode;
  rightExtras?: ReactNode;
};

/** Layout Orkut clássico — 3 colunas: perfil | conteúdo | conexões. */
export function ProfileOrkutView({
  profile,
  isOwnProfile,
  isFriend,
  friendCount,
  friends,
  pendingFriends,
  carameloTier,
  showKing,
  accentColor,
  centerContent,
  rightExtras,
}: ProfileOrkutViewProps) {
  return (
    <div className="bc-orkut-profile-grid">
      <aside className="bc-orkut-col-left space-y-4">
        <section className="bc-orkut-card bc-orkut-sidebar-card p-5 text-center">
          <div
            className="mx-auto mb-3 w-fit rounded-full border-4 border-bc-white shadow-lg"
            style={{ borderColor: accentColor }}
          >
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="lg"
            />
          </div>
          <h1
            className="text-lg font-bold"
            style={{ color: accentColor }}
          >
            {profile.name}
          </h1>
          <p className="text-xs text-bc-brown">@{profile.username}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {profile.isFoundingMember && <FoundingMemberBadge />}
            <CarameloVerificadoBadge tier={carameloTier} />
            {showKing && <PatioKingBadge />}
          </div>
          {profile.showLocation && profile.locationCity && (
            <div className="mt-2 flex justify-center">
              <CarameloRadarBadge
                city={profile.locationCity}
                area={profile.locationArea}
              />
            </div>
          )}
          {isOwnProfile && profile.biscuitBalance > 0 && (
            <p className="mt-2 text-xs text-bc-caramel">
              🍪 {profile.biscuitBalance} biscoito
              {profile.biscuitBalance !== 1 ? "s" : ""}
            </p>
          )}

          <ProfilePersonalInfo
            birthDate={profile.birthDate}
            relationshipStatus={profile.relationshipStatus}
            locationCity={profile.locationCity}
            locationArea={profile.locationArea}
            showLocation={profile.showLocation}
            memberSince={profile.createdAt}
          />

          <ProfileInterestsTags interests={profile.interests} />

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {isOwnProfile && (
              <>
                <Link href="/configuracoes" className="bc-btn-secondary text-xs">
                  Editar perfil
                </Link>
                <CopyProfileLink username={profile.username} />
              </>
            )}
            {isFriend && (
              <Link
                href={`/mensagens?with=${profile.username}`}
                className="bc-btn-primary text-xs"
              >
                💬 Mensagem
              </Link>
            )}
          </div>

          {isOwnProfile && (
            <ProfileOrkutSidebarMenu pendingFriends={pendingFriends} />
          )}
        </section>
      </aside>

      <div className="bc-orkut-col-center space-y-4">{centerContent}</div>

      <aside className="bc-orkut-col-right space-y-4">
        <ProfileOrkutFriendsPanel
          friends={friends}
          friendCount={friendCount}
        />
        {rightExtras}
      </aside>
    </div>
  );
}

export function ProfileOrkutBioCard({ bio }: { bio: string }) {
  return (
    <section className="bc-orkut-card p-5">
      <h2 className="mb-3 text-sm font-bold text-bc-blue">Quem sou eu</h2>
      <ProfileBioRich text={bio} />
    </section>
  );
}

export function ProfileOrkutScrapsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bc-orkut-card p-5">
      <h2 className="mb-4 text-sm font-bold text-bc-blue">{title}</h2>
      <div className="bc-orkut-scraps space-y-4">{children}</div>
    </section>
  );
}
