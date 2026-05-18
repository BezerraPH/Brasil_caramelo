import { AppVersionBadge } from "./AppVersionBadge";

/** Faixa de versão acima da MobileNav (só celular). */
export function AppVersionMobileStrip() {
  return (
    <div
      className="bc-app-footer fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center border-t border-bc-blue/8 bg-bc-white/90 py-1 backdrop-blur-sm md:hidden dark:bg-[var(--background)]/90"
      aria-hidden
    >
      <AppVersionBadge showStage />
    </div>
  );
}
