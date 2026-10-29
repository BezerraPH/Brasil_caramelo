export type TestimonialReply = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromUsername: string;
  fromAvatarUrl?: string | null;
  content: string;
  createdAt: string;
};

export type TestimonialThread = {
  mainText: string;
  replies: TestimonialReply[];
};

export const THREAD_SEPARATOR = "\n\n<!-- BC_THREAD_REPLIES_V1 -->\n";

/**
 * Faz o parse de um depoimento/recado com thread de respostas encadeadas.
 */
export function parseTestimonialThread(rawContent: string): TestimonialThread {
  if (!rawContent || !rawContent.includes(THREAD_SEPARATOR)) {
    return { mainText: rawContent || "", replies: [] };
  }
  const [main, repliesJson] = rawContent.split(THREAD_SEPARATOR);
  try {
    const parsed = JSON.parse(repliesJson) as TestimonialReply[];
    return {
      mainText: main ?? rawContent,
      replies: Array.isArray(parsed) ? parsed : [],
    };
  } catch {
    return { mainText: rawContent, replies: [] };
  }
}

/**
 * Serializa o texto principal e as respostas na estrutura encadeada.
 */
export function serializeTestimonialThread(
  mainText: string,
  replies: TestimonialReply[]
): string {
  if (!replies || replies.length === 0) return mainText;
  return `${mainText}${THREAD_SEPARATOR}${JSON.stringify(replies)}`;
}
