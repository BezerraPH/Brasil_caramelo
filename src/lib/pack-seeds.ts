import { prisma } from "./prisma";

export const OFFICIAL_PACKS = [
  {
    slug: "odeio-acordar-cedo",
    name: "Eu Odeio Acordar Cedo (Versão Caramelo)",
    description:
      "Para quem bate o despertador três vezes e ainda posta scrap às 6h59. Solidariedade matinal.",
    bannerColor: "#C68642",
  },
  {
    slug: "so-add-com-scrap",
    name: "Só add com scrap",
    description:
      "Regra simples: amizade só vale com recado público. Sem scrap, sem add.",
    bannerColor: "#2D8B57",
  },
  {
    slug: "tamo-junto-cafe-pix",
    name: "Tamo junto, aceito café e pix",
    description:
      "Matilha raiz de gente boa. Café, conversa fiada e aquele pix simbólico de R$ 2.",
    bannerColor: "#C68642",
  },
] as const;

/** Garante Matilhas oficiais do ALPHA (idempotente). */
export async function ensureOfficialPacks(): Promise<void> {
  const admin = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) return;

  for (const pack of OFFICIAL_PACKS) {
    const existing = await prisma.pack.findUnique({
      where: { slug: pack.slug },
    });
    if (existing) continue;

    const created = await prisma.pack.create({
      data: {
        slug: pack.slug,
        name: pack.name,
        description: pack.description,
        ownerId: admin.id,
      },
    });

    await prisma.packMember.create({
      data: { packId: created.id, userId: admin.id },
    });
  }
}
