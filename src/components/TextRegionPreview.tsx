import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { TextBox } from '../types/translation';
import { useLogStore } from '../store/logStore';

interface TextRegionPreviewProps {
  imageUrl: string;
  textBoxes: TextBox[];
  onVerify: (verified: boolean) => void;
  onRetry: () => void;
}

export function TextRegionPreview({ imageUrl, textBoxes, onVerify, onRetry }: TextRegionPreviewProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedBox, setSelectedBox] = useState<TextBox | null>(null);
  const addLog = useLogStore((state) => state.addLog);

  const handleVerify = (isCorrect: boolean) => {
    addLog('info', 'OCR', `Text regions ${isCorrect ? 'verified' : 'marked for retry'}`);
    onVerify(isCorrect);
  };

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
          title={showOverlay ? 'Hide text regions' : 'Show text regions'}
        >
          {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative">
        <img
          src={imageUrl}
          alt="Original"
          className="w-full h-auto"
        />
        
        {showOverlay && (
          <div className="absolute inset-0">
            {textBoxes.map((box, index) => (
              <div
                key={index}
                className={`absolute border-2 ${
                  selectedBox === box
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-red-500 bg-red-500/10'
                } cursor-pointer transition-colors`}
                style={{
                  left: `${box.bbox.x0}px`,
                  top: `${box.bbox.y0}px`,
                  width: `${box.bbox.x1 - box.bbox.x0}px`,
                  height: `${box.bbox.y1 - box.bbox.y0}px`
                }}
                onClick={() => setSelectedBox(box)}
                title={box.text}
              />
            ))}
          </div>
        )}
      </div>

      {selectedBox && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-200">
          <div className="max-w-lg mx-auto">
            <h3 className="font-medium mb-2">Detected Text:</h3>
            <p className="text-sm bg-gray-100 p-2 rounded mb-2">{selectedBox.text}</p>
            <button
              onClick={() => setSelectedBox(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
        <button
          onClick={() => handleVerify(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <Check className="w-4 h-4" />
          Verify & Continue
        </button>
        <button
          onClick={() => handleVerify(false)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <AlertCircle className="w-4 h-4" />
          Retry Detection
        </button>
      </div>
    </div>
  );
}