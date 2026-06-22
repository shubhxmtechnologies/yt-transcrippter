import { useState, useEffect } from 'react';
import { HeroBand } from './components/HeroBand';
import { Navbar } from './components/Navbar';
import { VideoInfo } from './components/VideoInfo';
import { TranscriptPanel } from './components/TranscriptPanel';
import { ChatPanel } from './components/ChatPanel';
import { HistorySidebar } from './components/HistorySidebar';
import { useTranscript } from './hooks/useTranscript';
import { useChat } from './hooks/useChat';
import { getSessions, getSession, deleteSession, type Session, type SessionSummary } from './lib/api';

export default function App() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);

  const transcript = useTranscript();
  const chat = useChat();

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);

      // Auto-restore session from localStorage if we don't have one
      if (!activeSession) {
        const savedId = localStorage.getItem('activeSessionId');
        if (savedId && data.some(s => s._id === savedId)) {
          handleSelectSession(savedId);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  const handleAnalyze = async (url: string) => {
    const session = await transcript.fetchTranscript(url);
    if (session) {
      setActiveSession(session);
      localStorage.setItem('activeSessionId', session._id);
      chat.setMessages(session.messages || []);
      fetchSessions(); // Refresh history
    }
  };

  const handleSelectSession = async (id: string) => {
    try {
      const session = await getSession(id);
      setActiveSession(session);
      localStorage.setItem('activeSessionId', session._id);
      chat.setMessages(session.messages || []);
    } catch (err) {
      console.error('Failed to load session', err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      if (activeSession?._id === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const handleNewChat = () => {
    setActiveSession(null);
    localStorage.removeItem('activeSessionId');
    chat.setMessages([]);
    chat.clearError();
  };

  const handleSendMessage = async (text: string) => {
    if (!activeSession) return;
    await chat.sendMessage(activeSession._id, text);
    // After sending, we don't necessarily need to refresh the sidebar unless we want to update the timestamp
  };

  return (
    <div className="app-layout" style={{ display: 'block', height: '100vh', overflow: 'hidden' }}>
      <Navbar
        onNewChat={handleNewChat}
        onToggleHistory={() => setSidebarOpen(true)}
        hasActiveSession={!!activeSession}
      />

      {activeSession ? (
        <main className="app-layout" style={{ height: 'calc(100vh - 64px)' }}>
          {leftPanelOpen && (
            <div className="left-panel">
              <VideoInfo
                title={activeSession.videoTitle}
                thumbnail={activeSession.thumbnail}
                videoUrl={activeSession.videoUrl}
                transcriptLength={activeSession.transcript.length}
              />
              <TranscriptPanel transcript={activeSession.transcript} />
            </div>
          )}
          <div className="right-panel">
            <ChatPanel
              messages={chat.messages}
              isStreaming={chat.isStreaming}
              error={chat.error}
              onSendMessage={handleSendMessage}
              leftPanelOpen={leftPanelOpen}
              onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
            />
          </div>
        </main>
      ) : (
        <HeroBand
          onSubmit={handleAnalyze}
          loading={transcript.loading}
          error={transcript.error}
        />
      )}

      <HistorySidebar
        open={sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSession?._id || null}
        onClose={() => setSidebarOpen(false)}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
