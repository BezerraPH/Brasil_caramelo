/** Link canônico para destacar um recado no feed. */
export function feedPostPath(postId: string): string {
  return `/feed?post=${encodeURIComponent(postId)}`;
}
