export async function transcribeAudio(blob) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not set in environment variables');
  }

  // Convert Blob to File object (required by FormData)
  const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Whisper API error: ${errorData.error.message}`);
  }

  const data = await response.json();
  return data.text; // the transcription
}
