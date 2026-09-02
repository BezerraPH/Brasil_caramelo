import { redirect } from "next/navigation";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { MatilhaConnectionBanner } from "@/components/MatilhaConnectionBanner";
import { CallProvider } from "@/components/CallProvider";
import { GlobalLiveListener } from "@/components/GlobalLiveListener";
import { MobileNav } from "@/components/MobileNav";
import { NavBar } from "@/components/NavBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ToastProvider } from "@/components/ToastProvider";
import { ViewModeSwitcher } from "@/components/ViewModeSwitcher";
import { ModeShell } from "@/components/ModeShell";
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
      <CallProvider
        userId={user.id}
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      >
      <GlobalLiveListener
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      <PwaInstallBanner />
      <MatilhaConnectionBanner />
      <NavBar
        user={user}
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      <ModeShell viewMode={user.viewMode}>
      {children}
      </ModeShell>
      <MobileNav
        userId={user.id}
        pusherKey={process.env.NEXT_PUBLIC_PUSHER_KEY ?? null}
        pusherCluster={process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null}
      />
      <ViewModeSwitcher currentMode={user.viewMode} />
      <ScrollToTop />
      </CallProvider>
    </ToastProvider>
    </div>
  );
}
