import { useLogStore } from '../store/logStore';

interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
}

export async function preprocessImage(imageFile: File): Promise<ProcessedImage[]> {
  const addLog = useLogStore.getState().addLog;
  
  try {
    const img = await createImageBitmap(imageFile);
    addLog('info', `Processing image: ${img.width}x${img.height}`);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    
    const processings = [
      // Original with enhanced contrast
      {
        filter: 'contrast(1.2) brightness(1.05)',
        description: 'Enhanced contrast'
      },
      // High contrast for dark text
      {
        filter: 'contrast(1.4) brightness(1.1) saturate(1.1)',
        description: 'High contrast'
      },
      // Optimized for light text
      {
        filter: 'contrast(1.3) brightness(0.95) saturate(1.2)',
        description: 'Light text optimization'
      },
      // Sharpened
      {
        filter: 'contrast(1.2) brightness(1.05) saturate(1.1) blur(0.5px)',
        description: 'Sharpened'
      }
    ];
    
    const processed: ProcessedImage[] = [];
    
    for (const process of processings) {
      ctx.filter = process.filter;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
      });
      
      processed.push({
        blob,
        width: img.width,
        height: img.height
      });
      
      addLog('info', `Created ${process.description} version`);
    }
    
    return processed;
  } catch (error) {
    addLog('error', `Image preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}