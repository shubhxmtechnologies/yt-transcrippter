import { Plus, History } from 'lucide-react';

interface NavbarProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  hasActiveSession: boolean;
}

export function Navbar({ onNewChat, onToggleHistory, hasActiveSession }: NavbarProps) {
  return (
    <nav className="navbar">
      <a href="/" className="navbar__logo" onClick={(e) => { e.preventDefault(); onNewChat(); }}>
        <div className="navbar__logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <polygon points="10 11 15 14.5 10 18 10 11" />
          </svg>
        </div>
        TranscriptAI
      </a>

      <div className="navbar__actions">
        {hasActiveSession && (
          <button className="navbar__btn navbar__btn--primary" onClick={onNewChat}>
            <Plus size={14} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>
        )}
        <button className="navbar__btn navbar__btn--secondary" onClick={onToggleHistory}>
          <History size={14} strokeWidth={2} />
          <span>History</span>
        </button>
      </div>
    </nav>
  );
}
