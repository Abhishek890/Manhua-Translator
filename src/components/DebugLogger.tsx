import React, { useRef, useEffect } from 'react';
import { useLogStore } from '../store/logStore';
import { Terminal, Copy, Download, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function DebugLogger() {
  const { logs, clearLogs } = useLogStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const copyLogs = () => {
    const logText = logs
      .map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] [${log.type}] [${log.category}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(logText);
  };

  const downloadLogs = () => {
    const logText = logs
      .map(log => `[${new Date(log.timestamp).toISOString()}] [${log.type}] [${log.category}] ${log.message}`)
      .join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manga-translator-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (logs.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal className="w-4 h-4" />
          <span className="font-medium">Translation Debug Logs</span>
          <span className="text-xs text-gray-500">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLogs}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
            title="Copy logs"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={downloadLogs}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
            title="Download logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearLogs}
            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
            title="Clear logs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="overflow-y-auto max-h-[400px] font-mono text-xs p-3 space-y-1"
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className={`py-1.5 px-2 rounded flex items-start gap-2 ${
              log.type === 'error' ? 'bg-red-900/30 text-red-400' :
              log.type === 'warn' ? 'bg-yellow-900/30 text-yellow-400' :
              'text-gray-300'
            }`}
          >
            {getIcon(log.type)}
            <span className="text-gray-500 flex-shrink-0">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              log.category === 'OCR' ? 'bg-purple-900/50 text-purple-400' :
              log.category === 'Translation' ? 'bg-green-900/50 text-green-400' :
              log.category === 'Image' ? 'bg-blue-900/50 text-blue-400' :
              'bg-gray-900/50 text-gray-400'
            }`}>
              {log.category}
            </span>
            <span className="break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}