import React from 'react';
import { Handle, Position } from 'reactflow';
import { StatusBadge } from './StatusBadge';

interface AgentNodeProps {
  data: {
    label: string;
    sub: string;
    status: 'waiting' | 'running' | 'completed';
  };
}

export const AgentNode: React.FC<AgentNodeProps> = ({ data }) => {
  const statusColors = {
    waiting: 'border-slate-200 text-slate-500 bg-slate-50',
    running: 'border-blue-300 text-blue-700 bg-blue-50/80 shadow-sm animate-pulse',
    completed: 'border-emerald-300 text-emerald-700 bg-emerald-50/80',
  };

  return (
    <div className={`p-4 rounded-xl border text-left w-52 transition-all duration-300 bg-white ${statusColors[data.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-bold">AGENT NODE</span>
        <StatusBadge type="node" value={data.status} />
      </div>
      <div className="font-heading font-extrabold text-xs text-slate-900 uppercase">{data.label}</div>
      <div className="text-[9px] text-slate-500 mt-1 font-mono italic">{data.sub}</div>
      
      <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </div>
  );
};
export default AgentNode;
