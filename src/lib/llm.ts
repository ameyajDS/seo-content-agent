import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature,
  });

  return response.choices[0]?.message?.content ?? '';
}

export async function* streamChatCompletion(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7
): AsyncGenerator<string> {
  const stream = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
