// ─── Types ───

export interface Message {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Session {
  _id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  thumbnail: string;
  transcript: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  _id: string;
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Base ───

const API_BASE = import.meta.env.VITE_ENVIRONMENT == "development" ? '/api' : import.meta.env.VITE_API_URL

// ─── Helpers ───

function getUserId(): string {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
}

function getHeaders(extraHeaders = {}): HeadersInit {
  return {
    'X-User-Id': getUserId(),
    ...extraHeaders,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ─── API Functions ───

export async function fetchTranscript(url: string): Promise<Session> {
  const response = await fetch(`${API_BASE}/transcript`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ url }),
  });
  return handleResponse<Session>(response);
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ sessionId, message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Chat request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6); // Remove 'data: '
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  return fullResponse;
}

export async function getSessions(): Promise<SessionSummary[]> {
  const response = await fetch(`${API_BASE}/sessions`, {
    headers: getHeaders(),
  });
  return handleResponse<SessionSummary[]>(response);
}

export async function getSession(id: string): Promise<Session> {
  const response = await fetch(`${API_BASE}/sessions/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Session>(response);
}

export async function deleteSession(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
}
