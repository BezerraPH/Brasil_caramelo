type MatilhaRadarChartProps = {
  stats: { label: string; emoji: string; value: number }[];
};

export function MatilhaRadarChart({ stats }: MatilhaRadarChartProps) {
  const cx = 120;
  const cy = 120;
  const maxR = 80;
  const n = stats.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, r: number) => {
    const a = angle(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = stats
    .map((s, i) => {
      const r = (s.value / 100) * maxR;
      const [x, y] = point(i, r);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="rounded-xl border border-bc-green/30 bg-bc-white/80 p-4">
      <h3 className="mb-3 text-sm font-bold text-bc-green">📡 Raio-X da Matilha</h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <svg viewBox="0 0 240 240" className="h-48 w-48 shrink-0" aria-hidden>
          {gridLevels.map((level) => (
            <polygon
              key={level}
              points={stats
                .map((_, i) => {
                  const [x, y] = point(i, maxR * level);
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="var(--bc-green)"
              strokeOpacity={0.2}
            />
          ))}
          {stats.map((_, i) => {
            const [x, y] = point(i, maxR);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="var(--bc-green)"
                strokeOpacity={0.25}
              />
            );
          })}
          <polygon
            points={dataPoints}
            fill="var(--bc-caramel)"
            fillOpacity={0.35}
            stroke="var(--bc-caramel)"
            strokeWidth={2}
          />
        </svg>
        <ul className="grid grid-cols-2 gap-2 text-xs">
          {stats.map((s) => (
            <li key={s.label} className="rounded-lg bg-bc-green/5 px-2 py-1">
              {s.emoji} {s.label}{" "}
              <span className="font-bold text-bc-green">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
