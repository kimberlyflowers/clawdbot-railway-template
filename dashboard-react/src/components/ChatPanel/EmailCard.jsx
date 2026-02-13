export default function EmailCard() {
  return (
    <div className="email-card">
      <div className="email-header">
        <div className="email-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13 2 4" />
          </svg>
        </div>
        <div>
          <div className="email-title">Venue Confirmation Email</div>
          <div className="email-status">Ready for your review</div>
        </div>
      </div>
      <div className="email-desc">Confirmation email to venue for March 15th.</div>
      <button className="email-btn">Review &amp; Approve</button>
    </div>
  );
}
