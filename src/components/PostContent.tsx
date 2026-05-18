import Link from "next/link";
import { CONTENT_TOKEN_SPLIT } from "@/lib/mentions";

type PostContentProps = {
  content: string;
  className?: string;
};

export function PostContent({ content, className }: PostContentProps) {
  const parts = content.split(CONTENT_TOKEN_SPLIT);

  return (
    <p
      className={
        className ??
        "whitespace-pre-wrap text-sm leading-relaxed text-foreground/90"
      }
    >
      {parts.map((part, i) => {
        if (part.startsWith("#") && part.length > 1) {
          const tag = part.slice(1);
          return (
            <Link
              key={`${i}-h-${tag}`}
              href={`/buscar?tag=${encodeURIComponent(tag)}&tab=posts`}
              className="bc-hashtag font-medium text-bc-green hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@") && part.length > 1) {
          const username = part.slice(1).toLowerCase();
          return (
            <Link
              key={`${i}-m-${username}`}
              href={`/perfil/${username}`}
              className="font-medium text-bc-blue hover:underline"
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
