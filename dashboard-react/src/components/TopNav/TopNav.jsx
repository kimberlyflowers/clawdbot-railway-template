const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function TopNav() {
  return (
    <div className="topbar">
      <div className="topbar-logo">
        <div className="dot" />
        Bloomie
      </div>
      <div className="topbar-tabs">
        <button className="active">Chat</button>
        <button>Status</button>
        <button>Files</button>
      </div>
      <div className="topbar-right">
        <div className="topbar-dropdown">
          Bloomie Foundation <ChevronDown />
        </div>
        <div className="topbar-dropdown">
          Landing Page Project <ChevronDown />
        </div>
      </div>
    </div>
  );
}
