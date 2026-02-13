export default function Badge({ children, color = 'var(--green)', bg = 'var(--green-dim)' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 8,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
