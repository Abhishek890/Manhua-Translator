import React from 'react';
import { TranslationProgress } from '../types/translation';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: TranslationProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const getStatusColor = () => {
    switch (progress.stage) {
      case 'detecting':
        return 'bg-blue-500';
      case 'translating':
        return 'bg-green-500';
      case 'rendering':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {progress.stage !== 'completed' && progress.stage !== 'error' && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          <span className="font-medium">{progress.message}</span>
        </div>
        <span className="text-gray-500">
          {progress.progress.toFixed(1)}%
        </span>
      </div>
      
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
}