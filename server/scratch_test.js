import { YouTubeTranscriptApi } from '@hallelx/youtube-transcript';

async function test(videoId) {
  try {
    const api = new YouTubeTranscriptApi();
    const transcript = await api.fetch(videoId);
    console.log('Transcript length:', transcript.length);
    console.log('Transcript text preview:', transcript.slice(0, 3));
  } catch (e) {
    console.error('Error fetching transcript:', e);
  }
}

test('mKyaNr3jK-E');
