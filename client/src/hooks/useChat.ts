import { useState, useCallback } from 'react';
import { sendChatMessage, type Message } from '../lib/api';

interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (sessionId: string, text: string) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  clearError: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const sendMessage = useCallback(async (sessionId: string, text: string) => {
    if (!text.trim() || isStreaming) return;

    setError(null);

    // Add user message immediately (optimistic)
    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Add placeholder for assistant response
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    setIsStreaming(true);

    try {
      await sendChatMessage(sessionId, text.trim(), (chunk: string) => {
        // Update the last (assistant) message with new content
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + chunk,
            };
          }
          return updated;
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(message);
      // Remove the empty assistant message on error
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
          updated.pop();
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  return { messages, isStreaming, error, sendMessage, setMessages, clearError };
}
