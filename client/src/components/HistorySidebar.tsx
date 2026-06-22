import type { SessionSummary } from '../lib/api';
import { X, Trash2 } from 'lucide-react';

interface HistorySidebarProps {
  open: boolean;
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function HistorySidebar({
  open,
  sessions,
  activeSessionId,
  onClose,
  onSelectSession,
  onDeleteSession,
}: HistorySidebarProps) {
  return (
    <>
      <div
        className={`sidebar__overlay ${open ? 'sidebar__overlay--open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__title">Chat History</h2>
          <button className="sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar__list">
          {sessions.length === 0 ? (
            <div className="sidebar__empty">
              <p>No chat history yet.</p>
              <p className="text-mute">Start by analyzing a YouTube video.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`sidebar__item ${session._id === activeSessionId ? 'sidebar__item--active' : ''}`}
                onClick={() => { onSelectSession(session._id); onClose(); }}
              >
                <img
                  className="sidebar__item-thumb"
                  src={session.thumbnail}
                  alt={session.videoTitle}
                  loading="lazy"
                />
                <div className="sidebar__item-info">
                  <p className="sidebar__item-title">{session.videoTitle}</p>
                  <p className="sidebar__item-date">{formatDate(session.updatedAt)}</p>
                </div>
                <button
                  className="sidebar__item-delete"
                  onClick={(e) => { e.stopPropagation(); onDeleteSession(session._id); }}
                  aria-label="Delete session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
