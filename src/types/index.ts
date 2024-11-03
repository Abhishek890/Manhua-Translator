export interface ProcessedImage {
  id: string;
  originalUrl: string;
  translatedUrl: string;
  originalText: string;
  translatedText: string;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export interface TranslationResult {
  translatedImageUrl: string;
  originalText: string;
  translatedText: string;
}