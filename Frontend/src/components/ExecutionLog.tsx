import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExecutionLogProps {
  logs: string[];
}

export const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI AGENT EXECUTION LOGS</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-slate-400">ACTIVE</span>
        </div>
      </div>
      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5 text-green-400"
            >
              <span>{log}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <div className="text-slate-500 italic py-4 text-center">
            Awaiting pipeline activation...
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionLog;
