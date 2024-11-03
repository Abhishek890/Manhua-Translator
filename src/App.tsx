import React from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageList } from './components/ImageList';
import { SettingsModal } from './components/SettingsModal';
import { DebugLogger } from './components/DebugLogger';
import { BatchDownload } from './components/BatchDownload';
import { BookOpen } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Manga Translator</h1>
          </div>
          <SettingsModal />
        </div>

        <p className="text-center text-gray-600">
          Upload your Chinese manga and get instant English translations
        </p>

        <ImageUploader />
        <ImageList />
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <DebugLogger />
        </div>
      </div>
      <BatchDownload />
    </div>
  );
}