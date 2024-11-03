import { useLogStore } from '../store/logStore';

export async function translateWithGoogle(text: string): Promise<string> {
  const addLog = useLogStore.getState().addLog;

  if (!text.trim()) return text;

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    const translation = data[0]?.map((item: any[]) => item[0]).join(' ');

    if (!translation || translation === text) {
      throw new Error('Empty or unchanged translation result');
    }

    return translation.trim();
  } catch (error) {
    addLog('error', `Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}