import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { COSMETIC_BY_ID } from "@/lib/pet-cosmetics";
import { prisma } from "@/lib/prisma";

const cosmeticActionSchema = z.object({
  action: z.enum(["buy", "equip", "unequip"]),
  cosmeticId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { action, cosmeticId } = cosmeticActionSchema.parse(await request.json());
    const cosmetic = COSMETIC_BY_ID[cosmeticId];
    if (!cosmetic) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }

    let pet = await prisma.pet.findUnique({ where: { userId: user.id } });
    if (!pet) {
      pet = await prisma.pet.create({ data: { userId: user.id } });
    }

    const owned = new Set(pet.ownedCosmetics);

    if (action === "buy") {
      if (owned.has(cosmeticId)) {
        return NextResponse.json({ error: "Você já possui este item." }, { status: 409 });
      }
      if (pet.coins < cosmetic.price) {
        return NextResponse.json(
          { error: `Faltam ${cosmetic.price - pet.coins} CarameloCoins.` },
          { status: 400 },
        );
      }

      const updated = await prisma.pet.update({
        where: { id: pet.id },
        data: {
          coins: pet.coins - cosmetic.price,
          ownedCosmetics: [...pet.ownedCosmetics, cosmeticId],
        },
      });
      return NextResponse.json({ pet: updated });
    }

    if (action === "equip") {
      if (!owned.has(cosmeticId)) {
        return NextResponse.json({ error: "Compre o item na loja primeiro." }, { status: 400 });
      }

      const slotField =
        cosmetic.slot === "hat"
          ? "equippedHat"
          : cosmetic.slot === "collar"
            ? "equippedCollar"
            : "equippedAccessory";

      const updated = await prisma.pet.update({
        where: { id: pet.id },
        data: { [slotField]: cosmeticId },
      });
      return NextResponse.json({ pet: updated });
    }

    if (action === "unequip") {
      const slotField =
        cosmetic.slot === "hat"
          ? "equippedHat"
          : cosmetic.slot === "collar"
            ? "equippedCollar"
            : "equippedAccessory";

      const updated = await prisma.pet.update({
        where: { id: pet.id },
        data: { [slotField]: null },
      });
      return NextResponse.json({ pet: updated });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro na loja." }, { status: 500 });
  }
}
