import type { CSSProperties, ReactNode } from "react";
import type { DogReputationLevel } from "@/generated/prisma/enums";
import { getPersonalityTheme } from "@/lib/personality-theme";

type PersonalityProfileCardProps = {
  dominantLevel: DogReputationLevel | null | undefined;
  huskyShake?: boolean;
  children: ReactNode;
};

export function PersonalityProfileCard({
  dominantLevel,
  huskyShake,
  children,
}: PersonalityProfileCardProps) {
  const theme = getPersonalityTheme(dominantLevel);

  const style: CSSProperties | undefined = theme
    ? {
        ["--bc-personality-accent" as string]: theme.accent,
        ["--bc-personality-accent-soft" as string]: theme.accentSoft,
        ["--bc-personality-border" as string]: theme.border,
        ["--bc-personality-glow" as string]: theme.glow,
        ["--bc-personality-pattern" as string]: theme.pattern,
        borderColor: theme.border,
        boxShadow: theme.glow,
      }
    : undefined;

  const bannerClass =
    huskyShake || dominantLevel === "HUSKY"
      ? "bc-profile-banner--husky"
      : dominantLevel === "PINSCHER"
        ? "bc-profile-banner--pinscher"
        : "";

  return (
    <article
      className={`bc-card bc-animate-in bc-personality-profile overflow-hidden ${bannerClass}`}
      style={style}
      data-personality={dominantLevel ?? undefined}
    >
      {children}
    </article>
  );
}
