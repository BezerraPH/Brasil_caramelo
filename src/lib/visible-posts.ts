/** Filtros para recados visíveis publicamente (exclui removidos pelo Tribunal). */
export const VISIBLE_POST_WHERE = {
  tribunalHidden: false,
} as const;

export const VISIBLE_AUTHOR_WHERE = {
  shadowbanned: false,
} as const;

/** Cápsula do Tempo: oculto até liberar (autor sempre vê no perfil). */
export function capsuleVisibleWhere(viewerId: string) {
  const now = new Date();
  return {
    OR: [
      { capsuleReleaseAt: null },
      { capsuleReleaseAt: { lte: now } },
      { authorId: viewerId },
    ],
  };
}
