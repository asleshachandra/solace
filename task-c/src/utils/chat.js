export async function getChatResponse(messages) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not set');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Chat API error: ${errData.error.message}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
