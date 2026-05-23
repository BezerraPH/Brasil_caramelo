/** Filtros para recados visíveis publicamente (exclui removidos pelo Tribunal). */
export const VISIBLE_POST_WHERE = {
  tribunalHidden: false,
} as const;

export const VISIBLE_AUTHOR_WHERE = {
  shadowbanned: false,
} as const;
