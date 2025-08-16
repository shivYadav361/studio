import { AppLayout } from '@/components/shared/app-layout';
import { mockDoctors } from '@/lib/mock-data';
import { LayoutDashboard } from 'lucide-react';

const navItems = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const doctor = mockDoctors[0]; // Assuming doctor1 is logged in
  return (
    <AppLayout user={doctor} navItems={navItems}>
      {children}
    </AppLayout>
  );
}
