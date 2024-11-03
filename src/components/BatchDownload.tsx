import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import JSZip from 'jszip';
import { useLogStore } from '../store/logStore';

export function BatchDownload() {
  const images = useStore((state) => state.images);
  const addLog = useLogStore((state) => state.addLog);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const completedImages = images.filter(img => img.status === 'completed');

  if (completedImages.length < 2) {
    return null;
  }

  const handleBatchDownload = async () => {
    setIsDownloading(true);
    addLog('info', 'System', 'Starting batch download...');

    try {
      const zip = new JSZip();
      const downloads = completedImages.map(async (image, index) => {
        if (!image.translatedPreview) return;

        try {
          const response = await fetch(image.translatedPreview);
          const blob = await response.blob();
          const fileName = `translated-${index + 1}-${image.file.name}`;
          zip.file(fileName, blob);
          
          addLog('info', 'System', `Added ${fileName} to zip`);
        } catch (error) {
          addLog('error', 'System', `Failed to add ${image.file.name} to zip`);
        }
      });

      await Promise.all(downloads);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `translated-manga-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addLog('info', 'System', 'Batch download completed successfully');
    } catch (error) {
      addLog('error', 'System', 'Batch download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleBatchDownload}
      disabled={isDownloading}
      className={`fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white transition-colors ${
        isDownloading 
          ? 'bg-gray-500 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {isDownloading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Download className="h-5 w-5" />
      )}
      {isDownloading 
        ? 'Creating ZIP...' 
        : `Download All (${completedImages.length})`}
    </button>
  );
}