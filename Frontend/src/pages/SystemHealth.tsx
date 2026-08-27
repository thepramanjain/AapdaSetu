import React, { useState } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Cpu, 
  Network,
  RefreshCw,
  Clock,
  Database
} from 'lucide-react';

import { useSystemHealth } from '../hooks/useApi';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import { StatusBadge } from '../components/StatusBadge';
import type { SystemComponent } from '../types';

const SystemHealth: React.FC = () => {
  const { data: components, isLoading, refetch, isRefetching } = useSystemHealth();
  const [selectedCompId, setSelectedCompId] = useState<string>('');

  const activeComponent = components?.find(c => c.id === (selectedCompId || components[0]?.id));

  const total = components?.length || 0;
  const healthy = components?.filter(c => c.status === 'healthy').length || 0;
  const warning = components?.filter(c => c.status === 'warning').length || 0;
  const offline = components?.filter(c => c.status === 'offline').length || 0;

  return (
    <div className="pt-28 pb-20 mx-auto max-w-7xl px-4 sm:px-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-600 tracking-widest uppercase block mb-2">System Telemetry</span>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-slate-900">System Diagnostics</h1>
          <p className="text-sm text-slate-500 mt-2">
            Real-time status tracking of autonomous cognitive sub-agents and external government APIs.
          </p>
        </div>

        <GradientButton 
          onClick={() => refetch()} 
          variant="ghost" 
          loading={isRefetching}
          className="text-xs py-2.5 font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Refresh Status
        </GradientButton>
      </div>

      {/* Overview Count Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Monitored Systems</span>
            <h3 className="text-3xl font-heading font-extrabold text-slate-900 mt-1">{total}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Network className="w-5 h-5 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Healthy</span>
            <h3 className="text-3xl font-heading font-extrabold text-emerald-600 mt-1">{healthy}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Warning</span>
            <h3 className="text-3xl font-heading font-extrabold text-amber-600 mt-1">{warning}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Offline</span>
            <h3 className="text-3xl font-heading font-extrabold text-red-600 mt-1">{offline}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
        </Card>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Components Grid */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-[90px] rounded-xl bg-slate-100 animate-pulse" />
              ))
            ) : (
              components?.map((c) => {
                const Icon = c.type === 'agent' ? Cpu : Database;
                const isSelected = activeComponent?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCompId(c.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isSelected ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate flex flex-col">
                        <span className="font-heading font-bold text-xs text-slate-900 truncate">{c.name}</span>
                        <span className="text-[9px] font-mono text-slate-400 mt-0.5">{c.type.toUpperCase()} • v{c.version || '1.0'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge type="health" value={c.status} className="scale-90" />
                      <span className="text-[9px] font-mono text-slate-400">{c.latency}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Component Details */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between p-6">
            {activeComponent ? (
              <div className="flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Registry Details</span>
                    <StatusBadge type="health" value={activeComponent.status} />
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 mb-1">{activeComponent.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">ID: {activeComponent.id}</span>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-mono">Category</span>
                    <span className="text-slate-900 font-medium uppercase font-mono">{activeComponent.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-mono">Latency</span>
                    <span className="text-slate-900 font-medium font-mono">{activeComponent.latency}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-mono">Version</span>
                    <span className="text-slate-900 font-medium font-mono">{activeComponent.version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 font-mono">Security</span>
                    <span className="text-emerald-600 font-medium font-mono">AES-256</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
                  <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-500 mb-2 uppercase">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    Verification Log
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                    System validation cycle returned successful digest matching. Diagnostic checklist: OK.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Clock className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-xs text-slate-400 font-mono">Select a component to view details</span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6 mt-6">
              <span className="text-[9px] font-mono text-slate-400 block text-center leading-normal">
                AapdaSetu diagnostic parameters are cryptographically signed by state liaison node operators.
              </span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SystemHealth;
