import { useLogStore } from '../store/logStore';

// Meta AI API wrapper for browser
class MetaAI {
  private static instance: MetaAI;
  private readonly API_ENDPOINTS = [
    'https://meta-llama-api.ai-gateway.mydomain.com/v1',
    'https://llama-api-proxy.vercel.app/api/chat',
    'https://meta-ai-proxy.herokuapp.com/api/translate'
  ];

  private constructor() {}

  static getInstance(): MetaAI {
    if (!MetaAI.instance) {
      MetaAI.instance = new MetaAI();
    }
    return MetaAI.instance;
  }

  async translate(text: string): Promise<string> {
    const prompt = `Translate the following Chinese text to English. Keep the translation natural and contextual, maintaining any manga/comic style expressions:

Chinese: ${text}

English translation:`;

    for (const endpoint of this.API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: prompt
            }],
            model: 'meta-llama/Llama-2-70b-chat',
            temperature: 0.7,
            max_tokens: 200,
            stream: false
          })
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const translation = data.choices?.[0]?.message?.content?.trim() ||
                          data.response?.trim() ||
                          data.translation?.trim();

        if (translation && translation !== text) {
          // Clean up the response to extract just the translation
          const cleanTranslation = translation
            .replace(/English translation:/i, '')
            .replace(/Translation:/i, '')
            .trim();

          return cleanTranslation;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('Meta AI translation failed');
  }
}

export async function translateWithMetaAI(text: string): Promise<string> {
  const addLog = useLogStore.getState().addLog;
  const metaAI = MetaAI.getInstance();

  try {
    addLog('info', 'Starting Meta AI translation...');
    const translation = await metaAI.translate(text);
    addLog('info', 'Meta AI translation successful');
    return translation;
  } catch (error) {
    addLog('error', `Meta AI translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}