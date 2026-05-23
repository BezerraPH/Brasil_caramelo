import { VISIBLE_AUTHOR_WHERE, VISIBLE_POST_WHERE } from "./visible-posts";

/** Recados públicos do feed global (exclui casinhas e tribunal). */
export const MATILHA_POST_WHERE = {
  communityLevel: null,
  ...VISIBLE_POST_WHERE,
} as const;

export const MATILHA_POST_WITH_AUTHOR = {
  ...MATILHA_POST_WHERE,
  author: VISIBLE_AUTHOR_WHERE,
} as const;
