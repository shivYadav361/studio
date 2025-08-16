import { AppLayout } from '@/components/shared/app-layout';
import { mockPatients } from '@/lib/mock-data';
import { LayoutDashboard, CalendarCheck } from 'lucide-react';

const navItems = [
  { href: '/patient/dashboard', label: 'Doctors', icon: LayoutDashboard },
  { href: '/patient/appointments', label: 'My Appointments', icon: CalendarCheck },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const patient = mockPatients[0];
  return (
    <AppLayout user={patient} navItems={navItems}>
      {children}
    </AppLayout>
  );
}
