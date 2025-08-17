
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, type LucideIcon, LayoutDashboard, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarCheck,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface AppLayoutProps {
  user: User;
  navItems: NavItem[];
  children: React.ReactNode;
}

export function AppLayout({ user, navItems, children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await auth.signOut();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };

  const renderNavLinks = (isMobile = false) => (
    <nav className={cn("flex flex-col gap-2", isMobile ? "mt-6" : "")}>
      {navItems.map((item) => {
        const Icon = iconMap[item.icon];
        return (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
              className="justify-start gap-2"
              asChild
            >
              <Link href={item.href}>
                {Icon && <Icon className="h-5 w-5" />}
                <span>{item.label}</span>
              </Link>
            </Button>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex w-full items-center justify-between">
            <div className="hidden md:block">
                <Logo />
            </div>
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                <div className="mb-4">
                  <Logo />
                </div>
                {renderNavLinks(true)}
                <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </Button>
                </div>
                </SheetContent>
            </Sheet>

            <div className="flex items-center gap-4">
                <span className='font-medium'>{user.name}</span>
                <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" className="hidden md:flex" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
          {renderNavLinks()}
          <div className="mt-auto">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
