import Link from "next/link";
import { HASHTAG_SPLIT } from "@/lib/hashtags";

type PostContentProps = {
  content: string;
  className?: string;
};

export function PostContent({ content, className }: PostContentProps) {
  const parts = content.split(HASHTAG_SPLIT);

  return (
    <p className={className ?? "whitespace-pre-wrap text-sm leading-relaxed text-foreground/90"}>
      {parts.map((part, i) => {
        if (part.startsWith("#") && part.length > 1) {
          const tag = part.slice(1);
          return (
            <Link
              key={`${i}-${tag}`}
              href={`/buscar?tag=${encodeURIComponent(tag)}&tab=posts`}
              className="bc-hashtag font-medium text-bc-green hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
