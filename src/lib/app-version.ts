import packageJson from "../../package.json";

export type ReleaseStage = "alpha" | "beta" | "stable";

/** Estágio de lançamento — altere para "beta" ou "stable" quando sair do alpha. */
export const RELEASE_STAGE: ReleaseStage = "alpha";

export const PACKAGE_VERSION: string = packageJson.version;

/** Semver base (ex.: 2.2.0 de 2.2.0-alpha.0). */
export function getSemverBase(): string {
  const match = PACKAGE_VERSION.match(/^(\d+\.\d+\.\d+)/);
  return match?.[1] ?? PACKAGE_VERSION;
}

/** Rótulo curto para UI: v2.2.0-alpha */
export function getVersionDisplay(): string {
  if (RELEASE_STAGE === "stable") {
    return `v${PACKAGE_VERSION}`;
  }
  return `v${getSemverBase()}-${RELEASE_STAGE}`;
}

export function getVersionLong(): string {
  return `Brasil Caramelo ${getVersionDisplay()}`;
}

export function isPrerelease(): boolean {
  return RELEASE_STAGE !== "stable";
}
