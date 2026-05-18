import { redirect } from "next/navigation";
import { AlphaNoticeBanner } from "@/components/AlphaNoticeBanner";
import { AppVersionFooter } from "@/components/AppVersionFooter";
import { AppVersionMobileStrip } from "@/components/AppVersionMobileStrip";
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
    <div className={user.isPremium ? "bc-pedigree-user" : undefined}>
    <ToastProvider>
      <GlobalLiveListener
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      <AlphaNoticeBanner />
      <NavBar
        user={user}
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      {children}
      <AppVersionFooter />
      <AppVersionMobileStrip />
      <MobileNav />
      <ViewModeSwitcher currentMode={user.viewMode} />
    </ToastProvider>
    </div>
  );
}
