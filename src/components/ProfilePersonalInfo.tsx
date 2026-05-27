import type { RelationshipStatus } from "@/generated/prisma/enums";
import {
  computeAge,
  formatBirthday,
  formatLocationDisplay,
  RELATIONSHIP_LABELS,
} from "@/lib/profile-orkut";

type ProfilePersonalInfoProps = {
  birthDate: Date | null;
  relationshipStatus: RelationshipStatus | null;
  locationCity: string | null;
  locationArea: string | null;
  showLocation: boolean;
  memberSince: Date;
};

export function ProfilePersonalInfo({
  birthDate,
  relationshipStatus,
  locationCity,
  locationArea,
  showLocation,
  memberSince,
}: ProfilePersonalInfoProps) {
  const location = formatLocationDisplay(
    locationCity,
    locationArea,
    showLocation,
  );

  const rows: { label: string; value: string }[] = [];

  if (birthDate) {
    rows.push({
      label: "Aniversário",
      value: `${formatBirthday(birthDate)} (${computeAge(birthDate)} anos)`,
    });
  }
  if (relationshipStatus) {
    rows.push({
      label: "Relacionamento",
      value: RELATIONSHIP_LABELS[relationshipStatus],
    });
  }
  if (location) {
    rows.push({ label: "Localização", value: location });
  }
  rows.push({
    label: "Membro desde",
    value: memberSince.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
  });

  if (rows.length === 0) return null;

  return (
    <dl className="bc-orkut-info-list mt-4 space-y-2 border-t border-bc-blue/10 pt-4 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[7rem_1fr] gap-2">
          <dt className="font-semibold text-bc-brown/70">{row.label}</dt>
          <dd className="text-bc-brown">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
