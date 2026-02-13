export default function Avatar({ initials, small, online, style }) {
  return (
    <div className={`avatar${small ? ' sm' : ''}`} style={style}>
      {online && (
        <div
          className="online-dot"
          style={small ? { width: 8, height: 8, borderWidth: '1.5px' } : undefined}
        />
      )}
      {initials}
    </div>
  );
}
