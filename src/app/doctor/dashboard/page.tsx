
'use client';

import { useMemo, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { getAppointmentsForDoctor, getPatient } from '@/lib/firestore-service';
import { LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// Hardcoded doctor ID for demonstration. In a real app, this would come from auth.
const FAKE_DOCTOR_ID = 'doctor1';

interface PopulatedAppointment extends Appointment {
    patient: Patient | null;
}

export default function DoctorDashboardPage() {
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
        setLoading(true);
        const doctorAppointments = await getAppointmentsForDoctor(FAKE_DOCTOR_ID);

        const populatedAppointments = await Promise.all(
            doctorAppointments.map(async (app) => {
                const patient = await getPatient(app.patientId);
                return { ...app, patient };
            })
        );
        setAppointments(populatedAppointments);
        setLoading(false);
    }
    fetchAppointments();
  }, []);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const userAppointments = appointments
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const now = new Date();
    now.setHours(0,0,0,0);
    const upcoming = userAppointments.filter(a => new Date(a.appointmentDate) >= now);
    const past = userAppointments.filter(a => new Date(a.appointmentDate) < now).reverse();
    
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

  const renderAppointments = (apps: PopulatedAppointment[]) => {
    if (apps.length === 0) {
      return <p className="text-center text-muted-foreground py-10">No appointments in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {apps.map(app => {
          if (!app.patient) return null;
          return <AppointmentCard key={app.id} appointment={app} user={app.patient} perspective="doctor" />;
        })}
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
    </div>
  )
  
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Doctor Dashboard"
        description="View and manage your patient appointments."
        icon={LayoutDashboard}
      />
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          {loading ? renderSkeleton() : renderAppointments(upcomingAppointments)}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {loading ? renderSkeleton() : renderAppointments(pastAppointments)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
