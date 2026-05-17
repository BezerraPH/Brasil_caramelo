import { BattleArena } from "@/components/BattleArena";
import { PageContainer } from "@/components/PageContainer";
import { getCurrentUser } from "@/lib/auth";
import { finalizeExpiredBattles } from "@/lib/battles";
import { prisma } from "@/lib/prisma";

export default async function BatalhaPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await finalizeExpiredBattles();

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
    include: {
      requester: { select: { id: true, name: true, username: true } },
      addressee: { select: { id: true, name: true, username: true } },
    },
  });

  const friends = friendships.map((f) =>
    f.requesterId === user.id ? f.addressee : f.requester,
  );

  return (
    <PageContainer narrow>
      <header className="mb-6 text-center bc-animate-in">
        <h1 className="text-3xl font-bold text-bc-blue">Batalha de Fofura</h1>
        <p className="mt-2 text-bc-brown">
          Desafie um amigo — a matilha vota quem tem o pet mais fofo
        </p>
      </header>
      <BattleArena currentUserId={user.id} friends={friends} />
    </PageContainer>
  );
}
