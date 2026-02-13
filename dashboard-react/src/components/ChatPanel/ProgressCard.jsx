import ProgressRing from '../shared/ProgressRing';

const items = [
  { percent: 65, title: 'Chapter 2: Why Cla...', meta: '25 min left remaining · Opus', gradient: 'g1' },
  { percent: 75, title: 'Building the Landing...', meta: '4 min left remaining · Sonnet', gradient: 'g2' },
];

export default function ProgressCard() {
  return (
    <div className="progress-card">
      {items.map((item) => (
        <div className="progress-item" key={item.title}>
          <ProgressRing percent={item.percent} gradientId={item.gradient} />
          <div className="progress-detail">
            <div className="progress-title">{item.title}</div>
            <div className="progress-meta">{item.meta}</div>
          </div>
        </div>
      ))}
      <div className="view-progress">View full progress →</div>
    </div>
  );
}
