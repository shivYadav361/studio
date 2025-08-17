import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <HeartPulse className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-foreground">
        HealthHarbor
      </h1>
    </div>
  );
}
