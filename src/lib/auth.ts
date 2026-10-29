import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";
import { resolvePremiumStatus } from "./premium";
import { SESSION_COOKIE } from "./session-cookie";

export { SESSION_COOKIE };
const SESSION_DAYS = 30;

/** Em HTTP (rede local/IP direto) a flag 'secure' deve ser false para que os navegadores aceitem o cookie.
 *  Em HTTPS (Tailscale ou proxy SSL) ela deve ser true para segurança máxima. */
async function isRequestSecure(): Promise<boolean> {
  if (process.env.COOKIE_SECURE === "false") {
    return false;
  }
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto");
    if (proto) {
      return proto.toLowerCase() === "https";
    }
    const host = (h.get("host") || "").toLowerCase();
    if (
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.") ||
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1")
    ) {
      return false;
    }
  } catch {
    // Fora do contexto de requisição HTTP
  }
  return process.env.COOKIE_SECURE === "true";
}

async function sessionCookieOptions(expires: Date) {
  const secure = await isRequestSecure();
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  const options = await sessionCookieOptions(expiresAt);
  cookieStore.set(SESSION_COOKIE, token, options);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  const options = await sessionCookieOptions(new Date(0));
  cookieStore.set(SESSION_COOKIE, "", {
    ...options,
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          bio: true,
          avatarUrl: true,
          viewMode: true,
          isPremium: true,
          premiumUntil: true,
          shadowbanned: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return resolvePremiumStatus(session.user);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
