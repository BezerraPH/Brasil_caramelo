import { getVersionLong, isPrerelease } from "@/lib/app-version";
import { AppVersionBadge } from "./AppVersionBadge";

export function AppVersionFooter() {
  return (
    <footer
      className="bc-app-footer mx-auto hidden max-w-6xl border-t border-bc-blue/10 px-4 py-3 md:block"
      aria-label="Versão do aplicativo"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-bc-brown/70">{getVersionLong()}</p>
        <AppVersionBadge showStage={isPrerelease()} />
      </div>
    </footer>
  );
}
