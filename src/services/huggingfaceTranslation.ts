import { useLogStore } from '../store/logStore';

const HUGGINGFACE_ENDPOINTS = [
  'https://api-inference.huggingface.co/models/facebook/mbart-large-50-many-to-many-mmt',
  'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-zh-en',
  'https://api-inference.huggingface.co/models/liam168/trans-opus-mt-zh-en'
];

export async function translateWithHuggingFace(text: string): Promise<string> {
  const addLog = useLogStore.getState().addLog;
  
  for (const endpoint of HUGGINGFACE_ENDPOINTS) {
    try {
      addLog('info', `Trying HuggingFace endpoint: ${endpoint.split('/').pop()}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) {
        continue;
      }

      const result = await response.json();
      
      // Handle different response formats
      const translation = Array.isArray(result) 
        ? result[0]?.translation_text || result[0]?.generated_text
        : result.translation_text || result.generated_text;

      if (translation && translation !== text) {
        addLog('info', 'HuggingFace translation successful');
        return translation;
      }
    } catch (error) {
      addLog('warn', `HuggingFace endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue;
    }
  }

  throw new Error('All HuggingFace endpoints failed');
}