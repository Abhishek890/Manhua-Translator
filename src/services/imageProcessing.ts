import { TranslationResult, TextBox } from '../types/translation';
import { translateWithGoogle } from './translationService';
import { detectText } from './ocrService';
import { useTranslationStore } from '../store/translationStore';
import { useLogStore } from '../store/logStore';

export async function processImage(
  imageFile: File,
  id: string
): Promise<TranslationResult> {
  const updateProgress = useTranslationStore.getState().updateTranslation;
  const addLog = useLogStore.getState().addLog;

  try {
    updateProgress(id, {
      status: 'detecting',
      progress: 0,
      message: 'Detecting text...'
    });

    const textBoxes = await detectText(imageFile);
    
    if (textBoxes.length === 0) {
      throw new Error('No text detected in the image');
    }

    updateProgress(id, {
      status: 'translating',
      progress: 40,
      message: 'Translating text...'
    });

    // Group text boxes by their vertical position (same line if within 20px)
    const groupedBoxes = textBoxes.reduce((groups: TextBox[][], box) => {
      const existingGroup = groups.find(group =>
        group.some(b => Math.abs(b.bbox.y0 - box.bbox.y0) < 20)
      );
      
      if (existingGroup) {
        existingGroup.push(box);
        existingGroup.sort((a, b) => a.bbox.x0 - b.bbox.x0); // Sort horizontally within group
      } else {
        groups.push([box]);
      }
      return groups;
    }, []);

    // Sort groups vertically
    groupedBoxes.sort((a, b) => a[0].bbox.y0 - b[0].bbox.y0);

    // Flatten groups while maintaining order
    const orderedBoxes = groupedBoxes.flat();

    const translations = await Promise.all(
      orderedBoxes.map(async (box) => {
        try {
          return await translateWithGoogle(box.text);
        } catch (error) {
          addLog('error', `Translation failed for text: ${box.text}`);
          return box.text;
        }
      })
    );

    updateProgress(id, {
      status: 'rendering',
      progress: 70,
      message: 'Rendering translation...'
    });

    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Create background for text areas
    orderedBoxes.forEach(box => {
      const boxWidth = box.bbox.x1 - box.bbox.x0;
      const boxHeight = box.bbox.y1 - box.bbox.y0;
      
      // Fill with semi-transparent white background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
      ctx.fillRect(
        box.bbox.x0 - 2,
        box.bbox.y0 - 2,
        boxWidth + 4,
        boxHeight + 4
      );
    });

    // Render translations
    orderedBoxes.forEach((box, index) => {
      const translation = translations[index];
      if (!translation) return;

      const boxWidth = box.bbox.x1 - box.bbox.x0;
      const boxHeight = box.bbox.y1 - box.bbox.y0;

      // Calculate optimal font size
      const baseSize = Math.min(
        boxHeight * 0.85,
        (boxWidth * 0.95) / (translation.length * 0.6)
      );
      const fontSize = Math.min(Math.max(baseSize, 12), 24);

      // Configure text rendering
      ctx.font = `${fontSize}px 'Arial', sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      
      // Text wrapping with proper spacing
      const words = translation.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];
      const maxWidth = boxWidth * 0.95;

      // Calculate optimal line breaks
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      let startY = box.bbox.y0 + (boxHeight - totalHeight) / 2 + lineHeight / 2;

      // Draw each line with shadow for better readability
      lines.forEach(line => {
        const x = box.bbox.x0 + boxWidth / 2;
        
        // Draw shadow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(line, x + 1, startY + 1);
        
        // Draw text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillText(line, x, startY);
        
        startY += lineHeight;
      });
    });

    // Generate high-quality output
    const translatedImageUrl = canvas.toDataURL('image/jpeg', 0.95);

    updateProgress(id, {
      status: 'completed',
      progress: 100,
      message: 'Translation completed'
    });

    return {
      translatedImageUrl,
      originalText: orderedBoxes.map(box => box.text).join('\n'),
      translatedText: translations.join('\n'),
      textBoxes: orderedBoxes
    };

  } catch (error) {
    addLog('error', `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    updateProgress(id, {
      status: 'error',
      progress: 0,
      error: error instanceof Error ? error.message : 'Processing failed'
    });
    throw error;
  }
}