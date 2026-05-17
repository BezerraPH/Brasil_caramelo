import { redirect } from "next/navigation";
import { GlobalLiveListener } from "@/components/GlobalLiveListener";
import { MobileNav } from "@/components/MobileNav";
import { NavBar } from "@/components/NavBar";
import { ToastProvider } from "@/components/ToastProvider";
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
    <ToastProvider>
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
      <MobileNav />
      <ViewModeSwitcher currentMode={user.viewMode} />
    </ToastProvider>
  );
}
