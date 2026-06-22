import { useState, useMemo } from 'react';

interface TranscriptPanelProps {
  transcript: string;
}

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const highlightedTranscript = useMemo(() => {
    if (!searchQuery.trim()) return transcript;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return transcript.replace(regex, '<mark>$1</mark>');
  }, [transcript, searchQuery]);

  return (
    <div className={`transcript-panel ${collapsed ? 'transcript-panel--collapsed' : ''}`}>
      <div className="transcript-panel__header">
        <span className="transcript-panel__title">Transcript</span>
        <button
          className="transcript-panel__toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <polyline points="6 9 12 15 18 9" />
            ) : (
              <polyline points="18 15 12 9 6 15" />
            )}
          </svg>
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      <div className="transcript-panel__search">
        <input
          className="transcript-panel__search-input"
          type="text"
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="transcript-panel__content">
        <div
          className="transcript-panel__text"
          dangerouslySetInnerHTML={{ __html: highlightedTranscript }}
        />
      </div>
    </div>
  );
}
