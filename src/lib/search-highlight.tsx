import { Fragment } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Destaca o termo de busca no texto (case-insensitive). */
export function highlightSearchTerm(
  text: string,
  query: string,
): React.ReactNode {
  const term = query.trim().replace(/^#/, "");
  if (!term || term.length < 2) return text;

  const re = new RegExp(`(${escapeRegExp(term)})`, "gi");
  const parts = text.split(re);

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bc-search-highlight rounded px-0.5">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
