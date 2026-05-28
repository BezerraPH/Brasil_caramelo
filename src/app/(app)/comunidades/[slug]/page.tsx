import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityForum } from "@/components/CommunityForum";
import { CommunityJoinButton } from "@/components/CommunityJoinButton";
import { CommunityModsPanel } from "@/components/CommunityModsPanel";
import { CommunityMural } from "@/components/CommunityMural";
import { CommunityRulesPanel } from "@/components/CommunityRulesPanel";
import { PageContainer } from "@/components/PageContainer";
import { getCommunityBySlug } from "@/lib/communities";
import { getCurrentUser } from "@/lib/auth";

type PageProps = { params: Promise<{ slug: string }> };

export default async function CommunityPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { slug } = await params;
  const community = await getCommunityBySlug(slug, user.id);
  if (!community) notFound();

  const style = {
    "--bc-community-primary": community.themePrimary,
    "--bc-community-accent": community.themeAccent,
  } as React.CSSProperties;

  return (
    <PageContainer>
      <div className="bc-community-page bc-animate-in" style={style}>
        <header
          className="bc-community-banner mb-8 overflow-hidden rounded-2xl border-2 p-6 text-center shadow-md"
          style={{
            borderColor: `${community.themePrimary}44`,
            background: `linear-gradient(160deg, ${community.themePrimary}18 0%, ${community.themeAccent}28 50%, var(--bc-white) 100%)`,
          }}
        >
          <span className="bc-animate-float inline-block text-6xl">
            {community.emoji}
          </span>
          <h1
            className="mt-3 text-3xl font-extrabold"
            style={{ color: community.themePrimary }}
          >
            {community.name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-bc-brown">
            {community.description}
          </p>
          <p className="mt-2 text-xs text-bc-brown/80">
            {community.memberCount} participante
            {community.memberCount === 1 ? "" : "s"} · {community.category}
            {community.isModerator && " · você modera"}
            {community.isOwner && " · você é o dono"}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <CommunityJoinButton
              slug={community.slug}
              initialMember={community.isMember}
            />
            {community.pack && (
              <Link
                href={`/matilhas/${community.pack.slug}`}
                className="bc-btn-secondary"
              >
                Abrir Matilha →
              </Link>
            )}
          </div>
        </header>

        <CommunityRulesPanel
          slug={community.slug}
          initialRules={community.pinnedRules || ""}
          canEdit={community.canModerate}
          themePrimary={community.themePrimary}
        />

        <CommunityModsPanel
          slug={community.slug}
          isOwner={community.isOwner}
          themePrimary={community.themePrimary}
        />

        <CommunityMural
          slug={community.slug}
          isMember={community.isMember}
          themePrimary={community.themePrimary}
        />

        <CommunityForum
          slug={community.slug}
          isMember={community.isMember}
          canModerate={community.canModerate}
          themePrimary={community.themePrimary}
        />

        <p className="mt-6 text-center">
          <Link
            href="/comunidades"
            className="text-xs text-bc-blue hover:underline"
          >
            ← Todas as comunidades
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
