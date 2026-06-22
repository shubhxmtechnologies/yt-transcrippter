import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { Message } from '../lib/api';
import { ChatMessage } from './ChatMessage';
import { MessageSquare, Send, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  leftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
}

export function ChatPanel({ messages, isStreaming, error, onSendMessage, leftPanelOpen, onToggleLeftPanel }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onToggleLeftPanel}
            className="chat-action-btn"
            style={{ padding: '6px' }}
            title={leftPanelOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <span className="chat-panel__header-title">Chat</span>
        </div>
        {isStreaming && (
          <span className="text-mono text-mute" style={{ fontSize: '12px' }}>
            AI is responding...
          </span>
        )}
      </div>

      <div className="chat-panel__messages">
        {messages.length === 0 ? (
          <div className="chat-panel__empty">
            <MessageSquare size={48} className="chat-panel__empty-icon" strokeWidth={1.5} />
            <p className="chat-panel__empty-title">Ask anything about this video</p>
            <p className="chat-panel__empty-text">
              Your conversation context is preserved — the AI remembers everything you discuss.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg}
              isStreaming={isStreaming && idx === messages.length - 1}
              isChatStreaming={isStreaming}
              onRedo={onSendMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="hero__error" style={{ padding: '0 24px 8px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form className="chat-panel__input-area" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="chat-panel__input"
          type="text"
          placeholder="Ask a question about the video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
        />
        <button
          className="chat-panel__send"
          type="submit"
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
        >
          <Send size={18} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
