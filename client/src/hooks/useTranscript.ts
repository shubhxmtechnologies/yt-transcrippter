import { useState, useCallback } from 'react';
import { fetchTranscript as apiFetchTranscript, type Session } from '../lib/api';

interface UseTranscriptReturn {
  loading: boolean;
  error: string | null;
  fetchTranscript: (url: string) => Promise<Session | null>;
}

export function useTranscript(): UseTranscriptReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscript = useCallback(async (url: string): Promise<Session | null> => {
    setLoading(true);
    setError(null);

    try {
      // Basic URL validation
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        throw new Error('Please enter a YouTube URL');
      }

      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+/i;
      if (!youtubeRegex.test(trimmedUrl)) {
        throw new Error('Please enter a valid YouTube URL');
      }

      const session = await apiFetchTranscript(trimmedUrl);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transcript';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchTranscript };
}
