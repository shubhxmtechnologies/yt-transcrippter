/**
 * Generate a streaming chat response using the NVIDIA NIM API.
 *
 * Sends the transcript as system context and streams the assistant's
 * reply back chunk-by-chunk via the onChunk callback.
 *
 * @param {string} transcript — The full video transcript
 * @param {Array<{ role: string, content: string }>} messages — Conversation history
 * @param {AbortSignal} abortSignal — Signal to abort the fetch request
 * @param {(chunk: string) => void} onChunk — Called with each text chunk as it arrives
 * @returns {Promise<string>} — The full accumulated response
 */
export async function generateChatResponse(transcript, messages, abortSignal, onChunk) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL;

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured');
  }

  const systemPrompt = `You are an AI assistant analyzing a YouTube video transcript. You are having an ongoing conversation with a user about this video.
Answer the user's questions based on the transcript content AND your conversation history. If the user asks about previous questions or responses in this chat, refer to the conversation history. Be specific, cite timestamps when possible. 

CRITICAL INSTRUCTIONS:
- Keep your answers concise and direct.
- Do not generate long, unsolicited checklists, excessive formatting, or generic advice.
- If you cannot fulfill a request (like accessing external links), simply state that you cannot do it without adding unnecessary fluff.

Here is the transcript:\n\n${transcript}`;

  // Construct the full message array: system + conversation history
  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  // Call NVIDIA NIM chat completions endpoint with streaming enabled
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true,
    }),
    signal: abortSignal,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorBody}`);
  }

  // Parse the SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Append decoded chunk to the buffer
    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines from the buffer
    const lines = buffer.split('\n');
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith(':')) continue;

      // Check for stream end signal
      if (trimmed === 'data: [DONE]') continue;

      // Extract the JSON payload after "data: "
      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            onChunk(content);
          }
        } catch {
          // Skip malformed JSON chunks (partial data)
        }
      }
    }
  }

  return fullResponse;
}
