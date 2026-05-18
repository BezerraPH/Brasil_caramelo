import {
  getSemverBase,
  getVersionDisplay,
  getVersionLong,
  PACKAGE_VERSION,
  RELEASE_STAGE,
} from "@/lib/app-version";
import { AppVersionBadge } from "./AppVersionBadge";

export function AppAboutCard() {
  return (
    <section className="bc-card bc-animate-in mt-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-bc-blue">Sobre o app</h2>
          <p className="mt-1 text-sm text-bc-brown">
            Brasil Caramelo está em fase <strong>Alpha</strong> — recursos novos
            chegam toda semana; pode haver instabilidade.
          </p>
        </div>
        <AppVersionBadge />
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-bc-blue/8 px-3 py-2">
          <dt className="text-[10px] uppercase text-bc-brown">Versão exibida</dt>
          <dd className="font-mono font-semibold text-bc-blue">
            {getVersionDisplay()}
          </dd>
        </div>
        <div className="rounded-lg bg-bc-green/10 px-3 py-2">
          <dt className="text-[10px] uppercase text-bc-brown">Pacote npm</dt>
          <dd className="font-mono text-bc-green">{PACKAGE_VERSION}</dd>
        </div>
        <div className="rounded-lg bg-bc-caramel/15 px-3 py-2 sm:col-span-2">
          <dt className="text-[10px] uppercase text-bc-brown">Estágio</dt>
          <dd className="capitalize text-bc-brown">
            {RELEASE_STAGE} · semver base {getSemverBase()}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-bc-brown/70">{getVersionLong()}</p>
    </section>
  );
}
