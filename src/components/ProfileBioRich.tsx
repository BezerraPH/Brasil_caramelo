import type { ReactNode } from "react";

/** "Quem sou eu" — formatação básica: **negrito**, *itálico*, quebras de linha. */
export function ProfileBioRich({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="bc-profile-bio-rich space-y-2 text-sm leading-relaxed text-bc-brown">
      {lines.map((line, i) => (
        <p key={i}>{parseInline(line)}</p>
      ))}
    </div>
  );
}

function parseInline(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = line;
  let key = 0;

  while (rest.length > 0) {
    const bold = rest.match(/^\*\*(.+?)\*\*/);
    const italic = rest.match(/^\*(.+?)\*/);

    if (bold) {
      parts.push(
        <strong key={key++} className="font-semibold text-bc-blue">
          {bold[1]}
        </strong>,
      );
      rest = rest.slice(bold[0].length);
    } else if (italic) {
      parts.push(
        <em key={key++} className="italic">
          {italic[1]}
        </em>,
      );
      rest = rest.slice(italic[0].length);
    } else {
      const nextSpecial = rest.search(/\*\*/);
      const chunk =
        nextSpecial === -1 ? rest : rest.slice(0, nextSpecial);
      if (chunk) parts.push(<span key={key++}>{chunk}</span>);
      rest = nextSpecial === -1 ? "" : rest.slice(nextSpecial);
    }
  }

  return parts.length > 0 ? parts : [line];
}
