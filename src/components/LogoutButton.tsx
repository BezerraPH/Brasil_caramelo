"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-bc-brown px-3 py-1 text-bc-brown transition hover:bg-bc-brown hover:text-white"
    >
      Sair
    </button>
  );
}
