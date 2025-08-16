import { AppLayout, type NavItem } from '@/components/shared/app-layout';
import { mockPatients } from '@/lib/mock-data';

const navItems: NavItem[] = [
  { href: '/patient/dashboard', label: 'Doctors', icon: 'LayoutDashboard' },
  { href: '/patient/appointments', label: 'My Appointments', icon: 'CalendarCheck' },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const patient = mockPatients[0];
  return (
    <AppLayout user={patient} navItems={navItems}>
      {children}
    </AppLayout>
  );
}
