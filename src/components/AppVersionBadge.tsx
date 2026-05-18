import {
  getVersionDisplay,
  isPrerelease,
  RELEASE_STAGE,
} from "@/lib/app-version";

type AppVersionBadgeProps = {
  className?: string;
  showStage?: boolean;
};

export function AppVersionBadge({
  className = "",
  showStage = true,
}: AppVersionBadgeProps) {
  const label = getVersionDisplay();
  const prerelease = isPrerelease();

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wide ${className}`}
      title={`Brasil Caramelo ${label}`}
    >
      {showStage && prerelease && (
        <span className="bc-alpha-tag rounded-md px-1.5 py-0.5 uppercase">
          {RELEASE_STAGE}
        </span>
      )}
      <span className="text-bc-brown/80">{label}</span>
    </span>
  );
}
