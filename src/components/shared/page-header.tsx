import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Icon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
