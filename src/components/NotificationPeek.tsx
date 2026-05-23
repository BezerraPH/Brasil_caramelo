import Link from "next/link";
import { prisma } from "@/lib/prisma";

type NotificationPeekProps = {
  userId: string;
};

export async function NotificationPeek({ userId }: NotificationPeekProps) {
  const [unread, latest] = await Promise.all([
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: { id: true, message: true, read: true, link: true },
    }),
  ]);

  if (unread === 0 && latest.length === 0) return null;

  return (
    <section className="bc-card bc-animate-in bc-notification-peek p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-bc-blue">🔔 Notificações</h2>
        {unread > 0 && (
          <span className="rounded-full bg-bc-caramel px-2 py-0.5 text-[10px] font-bold text-bc-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>
      {latest.length > 0 && (
        <ul className="mt-3 space-y-2">
          {latest.map((n) => (
            <li
              key={n.id}
              className={`rounded-lg px-2 py-1.5 text-xs ${n.read ? "text-bc-brown/80" : "bg-bc-blue/5 font-medium text-bc-brown"}`}
            >
              {n.message}
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/notificacoes"
        className="mt-3 block text-center text-xs font-semibold text-bc-blue hover:underline"
      >
        Ver todas →
      </Link>
    </section>
  );
}
