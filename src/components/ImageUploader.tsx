import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslationStore } from '../store/translationStore';
import { processImage } from '../services/imageProcessing';
import { ProgressIndicator } from './ProgressIndicator';

export function ImageUploader() {
  const addImage = useStore((state) => state.addImage);
  const updateImage = useStore((state) => state.updateImage);
  const updateTranslation = useTranslationStore((state) => state.updateTranslation);
  const images = useStore((state) => state.images);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const remainingSlots = 10 - images.length;
    const filesToProcess = acceptedFiles.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      
      addImage({
        id,
        file,
        preview,
        status: 'processing',
        uploadTime: new Date().toISOString()
      });

      updateTranslation(id, {
        status: 'detecting',
        progress: 0,
        message: 'Starting translation...',
        startTime: Date.now()
      });

      try {
        const result = await processImage(file, id);
        
        updateImage(id, {
          translatedPreview: result.translatedImageUrl,
          text: result.originalText,
          translation: result.translatedText,
          status: 'completed',
          completionTime: new Date().toISOString()
        });
      } catch (error) {
        updateImage(id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Processing failed',
          completionTime: new Date().toISOString()
        });
      }
    }
  }, [addImage, updateImage, updateTranslation, images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 10 - images.length,
    disabled: images.length >= 10
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
          images.length >= 10
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        {images.length >= 10 ? (
          <div className="text-gray-500">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm">Maximum number of images reached (10)</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the manga images here...'
                : 'Drag & drop manga images here, or click to select files'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports PNG, JPG, JPEG, WebP ({10 - images.length} slots remaining)
            </p>
          </>
        )}
      </div>
      
      <ProgressIndicator />
    </div>
  );
}