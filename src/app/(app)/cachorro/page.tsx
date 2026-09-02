import { PageContainer } from "@/components/PageContainer";
import { PetBreedingPanel } from "@/components/PetBreedingPanel";
import { PetGenealogyPanel } from "@/components/PetGenealogyPanel";
import { PetGame } from "@/components/PetGame";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CachorroPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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
    <PageContainer>
      <header className="bc-animate-in mb-6 text-center">
        <h1 className="text-3xl font-black text-bc-blue sm:text-4xl">Meu Caramelo Virtual</h1>
        <p className="mt-1 text-sm font-semibold text-bc-brown">
          Cuide do seu pet virtual, personalize acessórios e ganhe recompensas diárias
        </p>
      </header>

      <PetGame />

      <div className="mt-8 space-y-6">
        <PetBreedingPanel friends={friends} />
        <PetGenealogyPanel />
      </div>
    </PageContainer>
  );
}
