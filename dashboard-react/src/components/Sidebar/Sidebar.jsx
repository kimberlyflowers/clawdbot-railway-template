import Avatar from '../shared/Avatar';

const taskGroups = [
  {
    label: 'Today',
    tasks: [
      { title: 'Landing page and event graphics', date: 'Today', active: true },
      { title: 'Book Chapter 1 review', date: 'Today' },
    ],
  },
  {
    label: 'Yesterday',
    tasks: [
      { title: 'Eventbrite setup and logistics', date: 'Yesterday' },
      { title: 'School model comparison research', date: 'Yesterday' },
    ],
  },
  {
    label: 'Earlier',
    tasks: [
      { title: 'Mission statement drafting', date: 'Jan 28' },
      { title: 'Board member research', date: 'Jan 22' },
    ],
  },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <button className="new-chat-btn">+ New Chat</button>
      </div>

      <div className="agent-card">
        <div className="agent-header">
          <Avatar initials="SR" online />
          <div className="agent-info">
            <div className="agent-name">Sarah Rodriguez</div>
            <div className="agent-role">Growth &amp; Community Lead</div>
          </div>
          <button className="filter-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4h18M7 9h10M10 14h4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="autopilot">
        <div className="autopilot-dot" />
        Autopilot: 5 jobs &nbsp;✓&nbsp; All OK
      </div>

      <div className="task-list">
        {taskGroups.map((group) => (
          <div key={group.label}>
            <div className="task-group-label">{group.label}</div>
            {group.tasks.map((task) => (
              <div
                key={task.title}
                className={`task-item${task.active ? ' active' : ''}`}
              >
                <span className="task-item-title">{task.title}</span>
                <span className="task-item-date">{task.date}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="user-avatar">C</div>
        <div className="user-info">
          <div className="user-name">Charles</div>
          <div className="user-role">Owner</div>
        </div>
        <button className="user-chevron">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
