import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Finding surplus food matches...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-6">
      <div className="p-3 bg-brand-light text-brand-orange rounded-full mb-3 animate-spin">
        <Loader2 className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-brand-muted">{message}</p>
    </div>
  );
};
