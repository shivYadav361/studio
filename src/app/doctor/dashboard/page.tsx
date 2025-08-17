
'use client';

import { useMemo, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { getAppointmentsForDoctor, getPatient } from '@/lib/firestore-service';
import { LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth.tsx';

interface PopulatedAppointment extends Appointment {
    patient: Patient | null;
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        const doctorAppointments = await getAppointmentsForDoctor(user.uid);

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
  }, [user]);

  const { upcomingAppointments, completedAppointments } = useMemo(() => {
    const sortedAppointments = appointments
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const upcoming = sortedAppointments.filter(a => a.status === 'booked');
    const completed = sortedAppointments.filter(a => a.status === 'completed').reverse();
    
    return { upcomingAppointments: upcoming, completedAppointments: completed };
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
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          {loading ? renderSkeleton() : renderAppointments(upcomingAppointments)}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {loading ? renderSkeleton() : renderAppointments(completedAppointments)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
