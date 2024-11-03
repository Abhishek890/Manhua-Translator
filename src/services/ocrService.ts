import { TextBox } from '../types/translation';
import { useLogStore } from '../store/logStore';

const OCR_SPACE_API_KEY = 'K89675019788957';

interface OCRWord {
  WordText: string;
  Left: number;
  Top: number;
  Height: number;
  Width: number;
  Confidence: number;
}

interface OCRLine {
  Words: OCRWord[];
  MaxHeight: number;
  MinTop: number;
}

function shouldJoinWords(word1: OCRWord, word2: OCRWord): boolean {
  const horizontalGap = word2.Left - (word1.Left + word1.Width);
  const verticalOverlap = Math.min(
    Math.abs(word1.Top - word2.Top),
    Math.abs((word1.Top + word1.Height) - (word2.Top + word2.Height))
  );
  
  return horizontalGap < word1.Height * 0.5 && verticalOverlap < word1.Height * 0.3;
}

function groupWordsIntoLines(words: OCRWord[]): OCRLine[] {
  if (!words.length) return [];

  const sortedWords = [...words].sort((a, b) => {
    const verticalDiff = a.Top - b.Top;
    return Math.abs(verticalDiff) < 10 ? a.Left - b.Left : verticalDiff;
  });

  const lines: OCRLine[] = [];
  let currentLine: OCRWord[] = [sortedWords[0]];
  let minTop = sortedWords[0].Top;
  let maxHeight = sortedWords[0].Height;

  for (let i = 1; i < sortedWords.length; i++) {
    const currentWord = sortedWords[i];
    const lastWord = currentLine[currentLine.length - 1];
    
    const verticalDistance = Math.abs(currentWord.Top - lastWord.Top);
    const heightDifference = Math.abs(currentWord.Height - lastWord.Height);
    
    if (verticalDistance < maxHeight * 0.5 && heightDifference < maxHeight * 0.5) {
      currentLine.push(currentWord);
      minTop = Math.min(minTop, currentWord.Top);
      maxHeight = Math.max(maxHeight, currentWord.Height);
    } else {
      lines.push({ Words: currentLine, MaxHeight: maxHeight, MinTop: minTop });
      currentLine = [currentWord];
      minTop = currentWord.Top;
      maxHeight = currentWord.Height;
    }
  }

  if (currentLine.length > 0) {
    lines.push({ Words: currentLine, MaxHeight: maxHeight, MinTop: minTop });
  }

  return lines;
}

export async function detectText(imageFile: File): Promise<TextBox[]> {
  const addLog = useLogStore.getState().addLog;
  addLog('info', 'OCR', 'Starting OCR detection...');

  try {
    const formData = new FormData();
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('file', imageFile, 'image.jpg');
    formData.append('language', 'chs');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');
    formData.append('isTable', 'false');
    formData.append('isOverlayRequired', 'true');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.IsErroredOnProcessing || !data.ParsedResults?.[0]) {
      throw new Error(data.ErrorMessage || 'No results from OCR');
    }

    const result = data.ParsedResults[0];
    const textBoxes: TextBox[] = [];
    
    if (result.TextOverlay?.Lines) {
      const allWords: OCRWord[] = result.TextOverlay.Lines.flatMap(line => 
        line.Words?.filter(word => word.WordText.trim()) || []
      );

      const lines = groupWordsIntoLines(allWords);

      lines.forEach(line => {
        const sortedWords = [...line.Words].sort((a, b) => a.Left - b.Left);
        const segments: OCRWord[][] = [];
        let currentSegment: OCRWord[] = [sortedWords[0]];

        for (let i = 1; i < sortedWords.length; i++) {
          const currentWord = sortedWords[i];
          const lastWord = currentSegment[currentSegment.length - 1];

          if (shouldJoinWords(lastWord, currentWord)) {
            currentSegment.push(currentWord);
          } else {
            segments.push(currentSegment);
            currentSegment = [currentWord];
          }
        }
        segments.push(currentSegment);

        segments.forEach(segment => {
          const text = segment.map(word => word.WordText).join('');
          if (text.trim()) {
            const confidence = segment.reduce((acc, word) => acc + word.Confidence, 0) / segment.length;
            const left = Math.min(...segment.map(w => w.Left));
            const top = Math.min(...segment.map(w => w.Top));
            const right = Math.max(...segment.map(w => w.Left + w.Width));
            const bottom = Math.max(...segment.map(w => w.Top + w.Height));

            textBoxes.push({
              text: text.trim(),
              bbox: {
                x0: left,
                y0: top,
                x1: right,
                y1: bottom
              },
              confidence,
              verified: false
            });
          }
        });
      });
    }

    textBoxes.sort((a, b) => {
      const verticalDiff = a.bbox.y0 - b.bbox.y0;
      return Math.abs(verticalDiff) < 20 ? a.bbox.x0 - b.bbox.x0 : verticalDiff;
    });

    addLog('info', 'OCR', `Detected ${textBoxes.length} text regions with confidence scores`);
    return textBoxes;

  } catch (error) {
    addLog('error', 'OCR', `OCR detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}