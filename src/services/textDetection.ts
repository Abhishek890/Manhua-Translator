import { useLogStore } from '../store/logStore';
import { TextBox } from '../types/translation';

// Constants for text detection
const MIN_AREA = 100; // Minimum area for a text region
const MAX_AREA = 100000; // Maximum area for a text region
const MIN_ASPECT = 0.1; // Minimum aspect ratio (width/height)
const MAX_ASPECT = 10; // Maximum aspect ratio

interface TextRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  data: ImageData;
}

export async function detectTextRegions(imageFile: File): Promise<TextRegion[]> {
  const addLog = useLogStore.getState().addLog;
  
  try {
    // Create image bitmap
    const img = await createImageBitmap(imageFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const regions: TextRegion[] = [];
    
    // Convert to grayscale and detect edges
    const edgeData = detectEdges(imageData);
    
    // Find connected components (potential text regions)
    const components = findConnectedComponents(edgeData, canvas.width, canvas.height);
    
    addLog('info', `Found ${components.length} potential text regions`);
    
    // Filter and extract regions
    for (const comp of components) {
      const area = comp.width * comp.height;
      const aspect = comp.width / comp.height;
      
      if (area >= MIN_AREA && area <= MAX_AREA && 
          aspect >= MIN_ASPECT && aspect <= MAX_ASPECT) {
        
        // Extract region from original image
        const regionData = ctx.getImageData(comp.x, comp.y, comp.width, comp.height);
        
        regions.push({
          x: comp.x,
          y: comp.y,
          width: comp.width,
          height: comp.height,
          data: regionData
        });
      }
    }
    
    addLog('info', `Filtered to ${regions.length} valid text regions`);
    return regions;
    
  } catch (error) {
    addLog('error', `Text region detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

function detectEdges(imageData: ImageData): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  // Create new ImageData for edge detection
  const edgeData = ctx.createImageData(imageData.width, imageData.height);
  const data = imageData.data;
  const output = edgeData.data;
  
  // Sobel operator for edge detection
  for (let y = 1; y < imageData.height - 1; y++) {
    for (let x = 1; x < imageData.width - 1; x++) {
      const idx = (y * imageData.width + x) * 4;
      
      // Convert to grayscale and detect edges
      const gx = (
        -1 * getGray(data, idx - 4 - imageData.width * 4) +
        1 * getGray(data, idx + 4 - imageData.width * 4) +
        -2 * getGray(data, idx - 4) +
        2 * getGray(data, idx + 4) +
        -1 * getGray(data, idx - 4 + imageData.width * 4) +
        1 * getGray(data, idx + 4 + imageData.width * 4)
      );
      
      const gy = (
        -1 * getGray(data, idx - 4 - imageData.width * 4) +
        -2 * getGray(data, idx - imageData.width * 4) +
        -1 * getGray(data, idx + 4 - imageData.width * 4) +
        1 * getGray(data, idx - 4 + imageData.width * 4) +
        2 * getGray(data, idx + imageData.width * 4) +
        1 * getGray(data, idx + 4 + imageData.width * 4)
      );
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const threshold = 50;
      
      output[idx] = output[idx + 1] = output[idx + 2] = magnitude > threshold ? 255 : 0;
      output[idx + 3] = 255;
    }
  }
  
  return edgeData;
}

function getGray(data: Uint8ClampedArray, idx: number): number {
  return (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
}

interface Component {
  x: number;
  y: number;
  width: number;
  height: number;
}

function findConnectedComponents(imageData: ImageData, width: number, height: number): Component[] {
  const visited = new Set<number>();
  const components: Component[] = [];
  const data = imageData.data;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      if (!visited.has(idx) && data[idx] === 255) {
        const component = {
          minX: x,
          minY: y,
          maxX: x,
          maxY: y
        };
        
        // Flood fill to find connected component
        const stack: [number, number][] = [[x, y]];
        visited.add(idx);
        
        while (stack.length > 0) {
          const [cx, cy] = stack.pop()!;
          
          // Update component bounds
          component.minX = Math.min(component.minX, cx);
          component.minY = Math.min(component.minY, cy);
          component.maxX = Math.max(component.maxX, cx);
          component.maxY = Math.max(component.maxY, cy);
          
          // Check neighbors
          const neighbors = [
            [cx - 1, cy], [cx + 1, cy],
            [cx, cy - 1], [cx, cy + 1]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4;
              if (!visited.has(nidx) && data[nidx] === 255) {
                stack.push([nx, ny]);
                visited.add(nidx);
              }
            }
          }
        }
        
        components.push({
          x: component.minX,
          y: component.minY,
          width: component.maxX - component.minX + 1,
          height: component.maxY - component.minY + 1
        });
      }
    }
  }
  
  return components;
}