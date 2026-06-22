import { YouTubeTranscriptApi } from '@hallelx/youtube-transcript';

/**
 * Extract the video ID from various YouTube URL formats.
 * Supports:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *
 * @param {string} url — YouTube video URL
 * @returns {string|null} — The extracted video ID, or null if invalid
 */
export function extractVideoId(url) {
  try {
    const urlObj = new URL(url);

    // youtube.com/watch?v=VIDEO_ID
    if (
      (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') &&
      urlObj.pathname === '/watch'
    ) {
      return urlObj.searchParams.get('v');
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1); // Remove leading "/"
    }

    // youtube.com/embed/VIDEO_ID or youtube.com/shorts/VIDEO_ID
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const embedMatch = urlObj.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
      if (embedMatch) {
        return embedMatch[2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch the transcript for a YouTube video and concatenate all segments.
 *
 * @param {string} url — YouTube video URL
 * @returns {Promise<string>} — The full transcript as a single string
 */
export async function fetchTranscript(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL — could not extract video ID');
  }

  const api = new YouTubeTranscriptApi();
  const segments = await api.fetch(videoId);

  if (!segments || segments.length === 0) {
    throw new Error('No transcript available for this video');
  }

  // Concatenate all segment text into one string
  const fullTranscript = segments.map((seg) => seg.text).join(' ');
  return fullTranscript;
}

/**
 * Fetch basic video metadata (title, thumbnail) via YouTube oEmbed API.
 *
 * @param {string} url — YouTube video URL
 * @returns {Promise<{ title: string, thumbnail: string }>}
 */
export async function fetchVideoMetadata(url) {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

  const response = await fetch(oEmbedUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch video metadata: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    title: data.title,
    thumbnail: data.thumbnail_url,
  };
}
