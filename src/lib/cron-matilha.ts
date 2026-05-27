import { createNotification } from "./notifications";
import { prisma } from "./prisma";

const POLL_LIFETIME_DAYS = 7;
const EVENT_REMINDER_HOURS = 24;

/** Libera cápsulas do tempo e notifica autores. */
export async function releaseTimeCapsules(): Promise<number> {
  const now = new Date();
  const due = await prisma.post.findMany({
    where: {
      capsuleReleaseAt: { lte: now },
      capsuleNotified: false,
    },
    select: { id: true, authorId: true },
    take: 50,
  });

  for (const post of due) {
    await createNotification(
      post.authorId,
      "CAPSULE_RELEASED",
      "Sua cápsula do tempo foi desenterrada — o recado voltou ao feed!",
      `/feed?post=${post.id}`,
    );
    await prisma.post.update({
      where: { id: post.id },
      data: { capsuleNotified: true, capsuleReleaseAt: null },
    });
  }

  return due.length;
}

/** Notifica membros da Matilha quando enquete encerra (7 dias ou closesAt). */
export async function notifyClosedPolls(): Promise<number> {
  const now = new Date();
  const polls = await prisma.threadPoll.findMany({
    where: {
      resultsNotifiedAt: null,
      OR: [
        { closesAt: { lte: now } },
        {
          closesAt: null,
          createdAt: {
            lte: new Date(
              now.getTime() - POLL_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
            ),
          },
        },
      ],
    },
    include: {
      thread: {
        select: {
          id: true,
          title: true,
          packId: true,
          pack: { select: { slug: true, name: true } },
        },
      },
      votes: { select: { userId: true } },
    },
    take: 20,
  });

  let count = 0;
  for (const poll of polls) {
    const members = await prisma.packMember.findMany({
      where: { packId: poll.thread.packId },
      select: { userId: true },
    });
    const link = `/matilhas/topico/${poll.thread.id}`;

    for (const m of members) {
      await createNotification(
        m.userId,
        "POLL_RESULTS",
        `Enquete encerrada: «${poll.thread.title}» — veja o resultado`,
        link,
      );
    }

    await prisma.threadPoll.update({
      where: { id: poll.id },
      data: { resultsNotifiedAt: now, closesAt: poll.closesAt ?? now },
    });
    count++;
  }

  return count;
}

/** Lembrete 24h antes de encontro da Matilha (quem confirmou RSVP). */
export async function remindPackEvents(): Promise<number> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + EVENT_REMINDER_HOURS * 60 * 60 * 1000);
  const windowStart = new Date(now.getTime() + (EVENT_REMINDER_HOURS - 1) * 60 * 60 * 1000);

  const events = await prisma.packEvent.findMany({
    where: {
      startsAt: { gte: windowStart, lt: windowEnd },
    },
    include: {
      pack: { select: { slug: true, name: true } },
      rsvps: { select: { userId: true } },
    },
    take: 30,
  });

  let sent = 0;
  for (const ev of events) {
    const link = `/matilhas/${ev.pack.slug}?tab=events`;
    for (const rsvp of ev.rsvps) {
      const dup = await prisma.notification.findFirst({
        where: {
          userId: rsvp.userId,
          type: "PACK_EVENT_REMINDER",
          link,
          createdAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
        },
      });
      if (dup) continue;
      await createNotification(
        rsvp.userId,
        "PACK_EVENT_REMINDER",
        `Amanhã: «${ev.title}» na Matilha ${ev.pack.name}`,
        link,
      );
      sent++;
    }
  }

  return sent;
}
