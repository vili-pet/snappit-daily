export function ProgressRing({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const ratio = max === 0 ? 0 : Math.min(1, value / max);
  return (
    <div className="progress-ring" role="img" aria-label={label}>
      <svg viewBox="0 0 128 128">
        <circle className="ring-track" cx="64" cy="64" r={radius} />
        <circle
          className="ring-value"
          cx="64"
          cy="64"
          r={radius}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ratio)}
        />
      </svg>
      <span className="ring-label">{label}</span>
    </div>
  );
}
