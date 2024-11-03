import React, { useState } from 'react';
import { Download, AlertCircle, Trash2, Clock, CheckCircle, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TextRegionPreview } from './TextRegionPreview';

export function ImageList() {
  const images = useStore((state) => state.images);
  const removeImage = useStore((state) => state.removeImage);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleDownload = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `translated-${filename}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {images.map((image) => (
        <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative aspect-[3/4] bg-gray-100">
            <img
              src={image.status === 'completed' ? image.translatedPreview : image.preview}
              alt="Manga page"
              className="absolute inset-0 w-full h-full object-contain"
            />
            {image.status === 'processing' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
              </div>
            )}
            {image.status === 'error' && (
              <div className="absolute inset-0 bg-red-500 bg-opacity-10 flex items-center justify-center">
                <div className="text-center p-4">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                  <p className="mt-2 text-sm text-red-600">{image.error}</p>
                </div>
              </div>
            )}
            {image.textBoxes && (
              <button
                onClick={() => setPreviewId(image.id)}
                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                title="View detected text regions"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {image.completionTime && image.uploadTime && (
                  <span>{formatDuration(image.uploadTime, image.completionTime)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {image.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                <span className="capitalize">{image.status}</span>
              </div>
            </div>

            {image.status === 'completed' && (
              <button
                onClick={() => handleDownload(image.translatedPreview || '', image.file.name)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            )}
            
            <button
              onClick={() => removeImage(image.id)}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ))}

      {previewId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <TextRegionPreview
              imageUrl={images.find(img => img.id === previewId)?.preview || ''}
              textBoxes={images.find(img => img.id === previewId)?.textBoxes || []}
              onVerify={(verified) => {
                if (!verified) {
                  // Trigger re-detection
                }
                setPreviewId(null);
              }}
              onRetry={() => {
                setPreviewId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}