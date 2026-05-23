import { PageContainer } from "@/components/PageContainer";
import { PetBreedingPanel } from "@/components/PetBreedingPanel";
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
    <PageContainer narrow>
      <header className="bc-animate-in mb-6 text-center">
        <h1 className="text-2xl font-bold text-bc-blue">Meu Caramelo</h1>
        <p className="text-sm text-bc-brown">
          Cuide do seu companheiro virtual todo dia
        </p>
      </header>
      <PetGame />
      <PetBreedingPanel friends={friends} />
    </PageContainer>
  );
}
