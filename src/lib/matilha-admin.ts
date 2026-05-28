import "server-only";

type AdminUser = { username: string };

/** Admin da matilha: lista em PREMIUM_ADMIN_USERNAMES ou header x-matilha-admin-secret. */
export function isMatilhaAdmin(user: AdminUser, request?: Request): boolean {
  const secret = process.env.EVENT_ADMIN_SECRET?.trim();
  if (request && secret) {
    const header = request.headers.get("x-matilha-admin-secret");
    if (header === secret) return true;
  }
  const raw = process.env.PREMIUM_ADMIN_USERNAMES?.trim();
  if (!raw) return false;
  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(user.username.toLowerCase());
}
