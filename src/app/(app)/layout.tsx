import { redirect } from "next/navigation";
import { GlobalLiveListener } from "@/components/GlobalLiveListener";
import { NavBar } from "@/components/NavBar";
import { ViewModeSwitcher } from "@/components/ViewModeSwitcher";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <>
      <GlobalLiveListener
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      <NavBar
        user={user}
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      {children}
      <ViewModeSwitcher currentMode={user.viewMode} />
    </>
  );
}
