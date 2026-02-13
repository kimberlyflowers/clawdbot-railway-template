import ProgressRing from '../shared/ProgressRing';

export default function LivePreview() {
  return (
    <div className="right-panel">
      <div className="browser-header">
        <div className="live-dot" />
        <div className="browser-label">
          LIVE <span>Chromium</span>
        </div>
        <div className="browser-actions">
          <button>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </button>
          <button>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="browser-window">
        <div className="browser-titlebar">
          <div className="traffic-lights">
            <span className="tl-red" />
            <span className="tl-yellow" />
            <span className="tl-green" />
          </div>
          <div className="browser-nav">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
          <div className="url-bar">
            <span className="lock">🔒</span> census.gov/data/datasets/income-poverty
          </div>
        </div>
        <div className="browser-content">
          <div className="skel" style={{ height: 24, width: '45%' }} />
          <div className="skel" style={{ height: 14, width: '70%' }} />
          <div className="skel" style={{ height: 14, width: '55%' }} />
          <div style={{ height: 12 }} />
          <div className="skel" style={{ height: 120, width: '100%' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skel" style={{ height: 80, flex: 1 }} />
            <div className="skel" style={{ height: 80, flex: 1 }} />
          </div>
          <div className="skel" style={{ height: 14, width: '60%' }} />
          <div className="skel" style={{ height: 14, width: '40%' }} />
        </div>
        <div className="browser-status">
          <div className="spinner" /> Extracting household income data...
        </div>
      </div>

      <div className="task-card-bottom">
        <ProgressRing percent={60} gradientId="g3" />
        <div className="task-card-info">
          <div className="task-card-title">Demographic Research</div>
          <div className="task-card-meta">3 of 5 steps · 12 min left</div>
          <div className="task-card-status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Pulling Census data for your area
          </div>
        </div>
      </div>
    </div>
  );
}
