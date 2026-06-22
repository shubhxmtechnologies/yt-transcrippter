import { useState, type FormEvent } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface HeroBandProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  error: string | null;
}

export function HeroBand({ onSubmit, loading, error }: HeroBandProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      onSubmit(url.trim());
    }
  };

  return (
    <section className="hero">
      {/* Animated mesh gradient backdrop */}
      <div className="hero__gradient" />

      <div className="hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Powered by NVIDIA NIM · Llama 3.3 70B
        </div>

        <h1 className="hero__title">
          Ask AI about any YouTube video.
        </h1>

        <p className="hero__subtitle">
          Paste a YouTube URL, get the transcript, and chat with AI about the content. Full context is preserved across your entire conversation.
        </p>

        <form className="hero__input-group" onSubmit={handleSubmit}>
          <input
            className="hero__input"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            className="hero__button"
            type="submit"
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <LoadingSpinner size="small" text="Analyzing..." />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </form>

        {error && <p className="hero__error">{error}</p>}

        <div className="hero__features">
          <div className="hero__feature">
            <svg className="hero__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Auto-extract transcripts
          </div>
          <div className="hero__feature">
            <svg className="hero__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Context-aware AI chat
          </div>
          <div className="hero__feature">
            <svg className="hero__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Never loses context
          </div>
        </div>
      </div>
    </section>
  );
}
