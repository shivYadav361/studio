
'use client';

import { useLoader } from '@/hooks/use-loader';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalLoader() {
  const { isLoading } = useLoader();

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-primary">Loading...</p>
      </div>
    </div>
  );
}
