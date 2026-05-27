import { createNotification } from "./notifications";
import { prisma } from "./prisma";

const PREMIUM_DAYS = 30;

export function buildPremiumReference(username: string): string {
  const safe = username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BC-${safe}-${tail}`;
}

export async function activatePremium(userId: string, days = PREMIUM_DAYS) {
  const premiumUntil = new Date();
  premiumUntil.setDate(premiumUntil.getDate() + days);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPremium: true, premiumUntil },
    select: { id: true, username: true },
  });

  await createNotification(
    userId,
    "PREMIUM_ACTIVATED",
    `Pedigree ativado até ${premiumUntil.toLocaleDateString("pt-BR")}. Obrigado por apoiar a matilha!`,
    "/premium",
  );

  return { user, premiumUntil };
}

export async function createPremiumOrder(userId: string, amountBrl: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, isPremium: true },
  });
  if (!user) return null;

  const reference = buildPremiumReference(user.username);

  const order = await prisma.premiumOrder.create({
    data: {
      userId,
      reference,
      amountBrl,
      provider: process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
        ? "mercadopago"
        : "pix_manual",
      status: "PENDING",
    },
  });

  return { order, username: user.username };
}

export async function fulfillPremiumOrder(
  lookup: { reference?: string; username?: string; externalId?: string },
) {
  let order =
    lookup.reference != null
      ? await prisma.premiumOrder.findUnique({
          where: { reference: lookup.reference },
          include: { user: { select: { id: true, username: true } } },
        })
      : null;

  if (!order && lookup.username) {
    const user = await prisma.user.findUnique({
      where: { username: lookup.username.toLowerCase() },
    });
    if (user) {
      order = await prisma.premiumOrder.findFirst({
        where: { userId: user.id, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, username: true } } },
      });
    }
  }

  if (!order) return { ok: false as const, error: "Pedido não encontrado." };
  if (order.status === "PAID") {
    return { ok: true as const, alreadyPaid: true, username: order.user.username };
  }

  await prisma.premiumOrder.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      externalId: lookup.externalId ?? order.externalId,
    },
  });

  await activatePremium(order.userId);

  return { ok: true as const, username: order.user.username, reference: order.reference };
}

export async function createMercadoPagoPreference(
  orderId: string,
  reference: string,
  amountBrl: string,
  payerEmail: string,
) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  const appUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!token || !appUrl) return null;

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: "Brasil Caramelo — Pedigree (30 dias)",
          quantity: 1,
          unit_price: parseFloat(amountBrl),
          currency_id: "BRL",
        },
      ],
      payer: { email: payerEmail },
      external_reference: reference,
      notification_url: `${appUrl.replace(/\/$/, "")}/api/premium/webhook/mercadopago`,
      back_urls: {
        success: `${appUrl}/premium?paid=1`,
        failure: `${appUrl}/premium?paid=0`,
        pending: `${appUrl}/premium?paid=pending`,
      },
      auto_return: "approved",
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
  };

  await prisma.premiumOrder.update({
    where: { id: orderId },
    data: { externalId: data.id ?? null, provider: "mercadopago" },
  });

  return {
    preferenceId: data.id,
    checkoutUrl: data.init_point ?? data.sandbox_init_point ?? null,
  };
}
