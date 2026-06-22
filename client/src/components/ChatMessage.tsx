import { useState, useEffect } from 'react';
import type { Message } from '../lib/api';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, RotateCcw } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  isChatStreaming?: boolean;
  onRedo?: (text: string) => void;
}

function formatTime(timestamp?: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessage({ message, isStreaming, isChatStreaming, onRedo }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isEmpty = !message.content && !isUser;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [loadingText, setLoadingText] = useState('AI is thinking...');

  useEffect(() => {
    if (!isEmpty || !isStreaming) return;
    
    const phrases = [
      'Reading the transcript...',
      'Analyzing context...',
      'Searching for details...',
      'Formulating response...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phrases.length;
      setLoadingText(phrases[i]);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isEmpty, isStreaming]);

  // Show typing indicator for empty assistant message during streaming
  if (isEmpty && isStreaming) {
    return (
      <div className="chat-message chat-message--assistant">
        <div className="chat-message__header">
          <span className="chat-message__role">TranscriptAI</span>
        </div>
        <div className="chat-message__content" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="chat-message__typing" style={{ padding: 0 }}>
            <span className="chat-message__typing-dot" />
            <span className="chat-message__typing-dot" />
            <span className="chat-message__typing-dot" />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--color-mute)', fontStyle: 'italic' }}>
            {loadingText}
          </span>
        </div>
      </div>
    );
  }

  if (isEmpty) return null;

  return (
    <div className={`chat-message chat-message--${message.role}`}>
      <div className="chat-message__header">
        <span className="chat-message__role">{isUser ? 'You' : 'TranscriptAI'}</span>
        <span className="chat-message__time">{formatTime(message.timestamp)}</span>
      </div>

      <div className="chat-message__content markdown-body">
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                
                if (!inline && match) {
                  return (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-lang">{match[1]}</span>
                        <CopyButton text={codeString} />
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: '0 0 6px 6px' }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      <div className="chat-message__actions">
        <button onClick={handleCopy} className="chat-action-btn" title="Copy Message">
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        {isUser && onRedo && !isChatStreaming && (
          <button onClick={() => onRedo(message.content)} className="chat-action-btn" title="Redo Message">
            <RotateCcw size={14} />
            <span>Redo</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Subcomponent for code block copy buttons
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="code-copy-btn">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}
