import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { LatidosRoomClient } from "@/components/LatidosRoomClient";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ packSlug: string }>;
};

export default async function MatilhaLatidosPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { packSlug } = await params;
  const pack = await prisma.pack.findUnique({
    where: { slug: packSlug },
    select: { id: true, slug: true, name: true },
  });
  if (!pack) notFound();

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: pack.id, userId: user.id } },
  });
  if (!member) notFound();

  return (
    <PageContainer>
      <LatidosRoomClient
        room={{ kind: "matilha", slug: pack.slug, name: pack.name }}
      />
    </PageContainer>
  );
}
