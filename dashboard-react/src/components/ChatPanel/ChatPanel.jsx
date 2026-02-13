import Avatar from '../shared/Avatar';
import ProgressCard from './ProgressCard';
import CompletedCard from './CompletedCard';
import EmailCard from './EmailCard';

function Message({ children }) {
  return (
    <div className="msg">
      <Avatar initials="SR" small online />
      <div className="msg-content">
        <div className="msg-name">Sarah Rodriguez</div>
        {children}
      </div>
    </div>
  );
}

export default function ChatPanel() {
  return (
    <div className="chat">
      <div className="chat-messages">
        <Message>
          <ProgressCard />
        </Message>

        <Message>
          <CompletedCard />
        </Message>

        <Message>
          <div className="msg-text">
            The Eventbrite is live! I also finished the venue confirmation email. Take a look and approve if it's good to send.
          </div>
          <div className="msg-time">11:48 PM</div>
        </Message>

        <Message>
          <EmailCard />
        </Message>
      </div>

      <div className="chat-bottom">
        <div className="using-indicator">
          Using: <span>Best for task (auto)</span>
        </div>
        <div className="chat-input-wrap">
          <span className="plus">+</span>
          <input type="text" placeholder="Tell Sarah what you need" />
          <button className="mic-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="1" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0014 0M12 17v4M8 21h8" />
            </svg>
          </button>
          <button className="send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
