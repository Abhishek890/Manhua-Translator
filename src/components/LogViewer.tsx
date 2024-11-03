import React from 'react';
import { useLogStore, LogEntry } from '../store/logStore';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function LogViewer() {
  const { logs, clearLogs } = useLogStore();
  
  if (logs.length === 0) return null;

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTimeString = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">Translation Logs</h3>
        <button
          onClick={clearLogs}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-80 p-3 space-y-2 text-sm">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 text-gray-700"
          >
            {getIcon(log.type)}
            <span className="text-gray-500 flex-shrink-0">
              {getTimeString(log.timestamp)}
            </span>
            <span className="break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}