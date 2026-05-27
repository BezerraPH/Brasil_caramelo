type ProfileInterestsTagsProps = {
  interests: string[];
  className?: string;
};

export function ProfileInterestsTags({
  interests,
  className = "",
}: ProfileInterestsTagsProps) {
  if (interests.length === 0) return null;

  return (
    <section className={`mt-4 ${className}`}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-bc-blue">
        Interesses
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {interests.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-bc-caramel/35 bg-bc-caramel/10 px-2.5 py-0.5 text-xs font-medium text-bc-brown"
          >
            {tag}
          </li>
        ))}
      </ul>
    </section>
  );
}
