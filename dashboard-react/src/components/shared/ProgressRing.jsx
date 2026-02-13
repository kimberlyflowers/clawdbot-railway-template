export default function ProgressRing({ percent, gradientId }) {
  const r = 16;
  const c = 2 * Math.PI * r; // ~100.5
  const offset = c - (percent / 100) * c;

  return (
    <div className="progress-ring">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle className="bg" cx="20" cy="20" r={r} />
        <circle
          className="fg"
          cx="20"
          cy="20"
          r={r}
          stroke={`url(#${gradientId})`}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ '--target': offset }}
        />
      </svg>
      <div className="pct">{percent}%</div>
    </div>
  );
}
