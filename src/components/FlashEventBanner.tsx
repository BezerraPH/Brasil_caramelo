type FlashEventBannerProps = {
  title: string;
  message: string;
  coinMultiplier: number;
  endsAt: string;
};

export function FlashEventBanner({
  title,
  message,
  coinMultiplier,
  endsAt,
}: FlashEventBannerProps) {
  const ends = new Date(endsAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bc-flash-banner bc-animate-in mb-4">
      <p className="text-xs font-bold uppercase tracking-wide text-bc-gold">
        🎉 Rolezinho ativo · {coinMultiplier}x moedas
      </p>
      <h2 className="mt-1 text-lg font-bold text-bc-blue">{title}</h2>
      <p className="mt-1 text-sm text-bc-brown">{message}</p>
      <p className="mt-2 text-xs text-bc-green">Até {ends}</p>
    </div>
  );
}
