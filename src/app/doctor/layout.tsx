import { AppLayout, type NavItem } from '@/components/shared/app-layout';
import { mockDoctors } from '@/lib/mock-data';

const navItems: NavItem[] = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const doctor = mockDoctors[0]; // Assuming doctor1 is logged in
  return (
    <AppLayout user={doctor} navItems={navItems}>
      {children}
    </AppLayout>
  );
}
