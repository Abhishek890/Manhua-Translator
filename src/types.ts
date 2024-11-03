export type ImageStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ProcessedImage {
  id: string;
  file: File;
  preview: string;
  translatedPreview?: string;
  status: ImageStatus;
  text?: string;
  translation?: string;
  error?: string;
  uploadTime?: string;
  completionTime?: string;
}