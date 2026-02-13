export default function CompletedCard({ title = 'Eventbrite Listing' }) {
  return (
    <div className="completed-card">
      <div className="check-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="completed-info">
        <div className="completed-label">Task completed</div>
        <div className="completed-title">{title}</div>
      </div>
    </div>
  );
}
