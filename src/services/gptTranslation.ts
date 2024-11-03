import { useLogStore } from '../store/logStore';

const FREE_GPT_ENDPOINTS = [
  {
    url: 'https://api.free-gpt.xyz/translate',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    url: 'https://free.churchless.tech/v1/chat/completions',
    headers: { 'Content-Type': 'application/json' }
  },
  {
    url: 'https://api.openai-proxy.com/v1/chat/completions',
    headers: { 'Content-Type': 'application/json' }
  }
];

async function createGPTPrompt(text: string): Promise<string> {
  return `Translate the following Chinese text to English. Keep the translation natural and contextual, maintaining any manga/comic style expressions:

Chinese: ${text}

English translation:`;
}

export async function translateWithGPT(text: string): Promise<string> {
  const addLog = useLogStore.getState().addLog;

  for (const endpoint of FREE_GPT_ENDPOINTS) {
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: endpoint.headers,
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: await createGPTPrompt(text)
          }],
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        continue; // Try next endpoint
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim();
      
      if (translation && translation !== text) {
        addLog('info', 'GPT translation successful');
        return translation;
      }
    } catch (error) {
      continue; // Try next endpoint
    }
  }

  throw new Error('All GPT endpoints failed');
}