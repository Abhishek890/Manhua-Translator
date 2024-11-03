import React, { useState } from 'react';
import { Settings, X, Info } from 'lucide-react';

export function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <Settings className="h-5 w-5" />
        <span>About</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">About Manga Translator</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-900">
                      This app uses OCR technology to detect Chinese text in manga images and translates it to English using Google Translate.
                    </p>
                    <p className="text-sm text-blue-900">
                      Simply upload your manga images, and the app will automatically process and translate the text while maintaining the original layout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Automatic Chinese text detection</li>
                  <li>Fast and accurate translation</li>
                  <li>Preserves manga layout and style</li>
                  <li>Supports multiple image formats</li>
                  <li>Download translated images</li>
                </ul>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}