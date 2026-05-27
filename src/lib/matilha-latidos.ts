import { prisma } from "./prisma";

export {
  getMatilhaLatidosPath,
  getMatilhaLatidosRoomName,
  getMatilhaLatidosTokenRoom,
} from "./matilha-latidos-shared";

/** Valida se o usuário pode entrar na sala de áudio da Matilha. */
export async function canJoinMatilhaLatidos(
  userId: string,
  packSlug: string,
): Promise<{ ok: boolean; packName?: string }> {
  const pack = await prisma.pack.findUnique({
    where: { slug: packSlug },
    select: { id: true, name: true },
  });
  if (!pack) return { ok: false };

  const member = await prisma.packMember.findUnique({
    where: { packId_userId: { packId: pack.id, userId } },
  });
  if (!member) return { ok: false };

  return { ok: true, packName: pack.name };
}
