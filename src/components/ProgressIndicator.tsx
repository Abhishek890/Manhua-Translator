import React from 'react';
import { useTranslationStore } from '../store/translationStore';
import { Loader2 } from 'lucide-react';

export function ProgressIndicator() {
  const translations = useTranslationStore((state) => state.translations);

  if (Object.keys(translations).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {Object.entries(translations).map(([id, translation]) => (
        <div key={id} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {translation.status !== 'completed' && translation.status !== 'error' && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
              <span className="text-sm font-medium text-gray-700 capitalize">
                {translation.status}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {translation.progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                translation.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${translation.progress}%` }}
            />
          </div>
          {translation.error && (
            <p className="mt-2 text-sm text-red-500">{translation.error}</p>
          )}
        </div>
      ))}
    </div>
  );
}