export interface TextBox {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  verified?: boolean;
  confidence?: number;
}

export type TranslationStage = 'detecting' | 'verifying' | 'translating' | 'rendering' | 'completed' | 'error';

export interface TranslationState {
  status: TranslationStage;
  progress: number;
  error?: string;
  message?: string;
  textBoxes?: TextBox[];
  startTime?: number;
}

export interface TranslationResult {
  translatedImageUrl: string;
  originalText: string;
  translatedText: string;
  textBoxes: TextBox[];
}