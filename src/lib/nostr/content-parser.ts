/**
 * src/lib/nostr/content-parser.ts — Sanitização e parsing defensivo de notas Nostr
 * Bloqueia protocolos perigosos (javascript:, data:, vbscript:)
 * Formata hashtags, URLs seguras e entidades nostr: (npub, note, nprofile)
 */

export interface ParsedSegment {
  type: "text" | "link" | "hashtag" | "nostr";
  content: string;
  url?: string;
}

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

/**
 * Sanitiza uma URL externa, garantindo apenas protocolos seguros (http, https, nostr).
 */
export function sanitizeUrl(rawUrl: string): string | null {
  try {
    const trimmed = rawUrl.trim();
    if (DANGEROUS_PROTOCOLS.test(trimmed)) {
      return null;
    }
    if (trimmed.startsWith("nostr:")) {
      return trimmed;
    }
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Divide o texto do evento Nostr em segmentos seguros para renderização JSX.
 */
export function parseNostrContent(text: string): ParsedSegment[] {
  if (!text) return [];

  // Regex para tokens: URLs, hashtags (#palavra), e entidades nostr: (nostr:npub1...)
  const tokenRegex = /(https?:\/\/[^\s<]+|nostr:(?:npub1|nsec1|note1|nprofile1|nevent1)[a-z0-9]+|#\w+)/gi;

  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const start = match.index;
    const matchedText = match[0];

    // Texto antes do token
    if (start > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, start),
      });
    }

    if (matchedText.startsWith("#")) {
      segments.push({
        type: "hashtag",
        content: matchedText,
        url: `/feed?tag=${encodeURIComponent(matchedText.slice(1))}`,
      });
    } else if (matchedText.startsWith("nostr:")) {
      const entity = matchedText.slice(6);
      segments.push({
        type: "nostr",
        content: `⚡ ${matchedText.slice(0, 16)}...`,
        url: `/perfil/${encodeURIComponent(entity)}`,
      });
    } else {
      const safe = sanitizeUrl(matchedText);
      if (safe) {
        segments.push({
          type: "link",
          content: matchedText,
          url: safe,
        });
      } else {
        // Se for URL maliciosa/insegura, renderiza apenas como texto plano desarmado
        segments.push({
          type: "text",
          content: "[link bloqueado por segurança]",
        });
      }
    }

    lastIndex = start + matchedText.length;
  }

  // Restante do texto
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return segments;
}
