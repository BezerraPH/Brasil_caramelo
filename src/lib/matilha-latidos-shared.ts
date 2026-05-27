/** Helpers de sala Latidos × Matilha (sem Prisma — seguro no client). */

export function getMatilhaLatidosRoomName(packSlug: string): string {
  return `bc-matilha-${packSlug}`;
}

export function getMatilhaLatidosTokenRoom(packSlug: string): string {
  return `matilha:${packSlug}`;
}

export function getMatilhaLatidosPath(packSlug: string): string {
  return `/latidos/m/${packSlug}`;
}
