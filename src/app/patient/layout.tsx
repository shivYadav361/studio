
'use client';

import { AppLayout, type NavItem } from '@/components/shared/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';


const navItems: NavItem[] = [
  { href: '/patient/dashboard', label: 'Doctors', icon: 'LayoutDashboard' },
  { href: '/patient/appointments', label: 'My Appointments', icon: 'CalendarCheck' },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
           <Skeleton className="h-8 w-24" />
           <div className="ml-auto flex items-center gap-4">
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-10 w-10 rounded-full" />
           </div>
        </header>
        <main className="flex-1 p-8"><Skeleton className="h-full w-full" /></main>
      </div>
    )
  }

  return (
    <AppLayout user={user} navItems={navItems}>
      {children}
    </AppLayout>
  );
}
