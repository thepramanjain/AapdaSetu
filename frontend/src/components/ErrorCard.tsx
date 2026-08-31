import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Card } from './Card';
import { GradientButton } from './GradientButton';

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message = 'Failed to load telemetry streams. Check secure node linkages.',
  onRetry,
  title = 'Connection Timeout Anomaly'
}) => {
  return (
    <Card className="border-red-200 bg-red-50 p-6 flex flex-col items-center text-center justify-center min-h-[180px]">
      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="font-heading font-bold text-sm text-white mb-1.5 uppercase font-mono tracking-wider">{title}</h3>
      <p className="text-xs text-gray-400 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <GradientButton onClick={onRetry} variant="danger" className="py-1.5 px-4 text-xs font-mono">
          <RefreshCcw className="w-3.5 h-3.5 mr-2 animate-spin-hover" />
          Retry Synchronization
        </GradientButton>
      )}
    </Card>
  );
};
