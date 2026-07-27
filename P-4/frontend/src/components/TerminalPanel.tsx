import React, { useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import type { LogMessage } from '../types';

interface TerminalPanelProps {
  logs: LogMessage[];
  title?: string;
  maxHeight?: string;
  showStatusIndicator?: boolean;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  logs,
  title = 'Live System Logs',
  maxHeight = 'h-[280px]',
  showStatusIndicator = true
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const levelColors = {
    info: 'text-primary-light',
    warn: 'text-warning',
    success: 'text-secondary-light',
    error: 'text-danger'
  };

  return (
    <div className={`flex flex-col ${maxHeight}`}>
      <div className="bg-[#0b0f19] border border-white/10 px-4 py-2.5 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            {title}
          </span>
        </div>
        {showStatusIndicator && (
          <div className="flex items-center gap-1.5 text-[9px] text-muted font-mono select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            <span>ONLINE</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 bg-black/90 p-4 border-x border-b border-white/10 rounded-b-xl overflow-y-auto font-mono text-[10px] leading-relaxed text-gray-300">
        {logs.map((log, idx) => (
          <div key={idx} className="mb-2 last:mb-0 border-b border-white/5 pb-1">
            <span className="text-gray-500">
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>{' '}
            <span className={`font-bold ${levelColors[log.level]}`}>
              [{log.agent.toUpperCase()}]
            </span>{' '}
            <span>{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-6 text-gray-600 font-mono text-[10px]">
            NO LOG TELMETRY CHANNELS BROADCASTING
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
export default TerminalPanel;
