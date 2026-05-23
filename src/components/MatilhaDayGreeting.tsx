type MatilhaDayGreetingProps = {
  name: string;
};

function greetingForHour(hour: number): string {
  if (hour < 6) return "Boa madrugada";
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function MatilhaDayGreeting({ name }: MatilhaDayGreetingProps) {
  const firstName = name.trim().split(/\s+/)[0] ?? name;
  const greet = greetingForHour(new Date().getHours());

  return (
    <p className="bc-day-greeting bc-animate-in text-sm text-bc-brown">
      {greet},{" "}
      <strong className="font-semibold text-bc-blue">{firstName}</strong> 🐾
    </p>
  );
}
