
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { getAppointmentsForPatient, getDoctor } from '@/lib/firestore-service';
import { CalendarCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

interface PopulatedAppointment extends Appointment {
    doctor: Doctor | null;
}

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        const userAppointments = await getAppointmentsForPatient(user.uid);
        
        const populatedAppointments = await Promise.all(
            userAppointments.map(async (app) => {
                const doctor = await getDoctor(app.doctorId);
                return { ...app, doctor };
            })
        );
        
        setAppointments(populatedAppointments);
        setLoading(false);
    }
    fetchAppointments();
  }, [user]);


  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const sortedAppointments = appointments
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const upcoming = sortedAppointments.filter(a => a.status === 'booked' && a.appointmentDate >= now);
    const past = sortedAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.appointmentDate < now);
    
    return { upcomingAppointments: upcoming.reverse(), pastAppointments: past.reverse() };
  }, [appointments]);

  const renderAppointments = (apps: PopulatedAppointment[]) => {
    if (apps.length === 0) {
      return <p className="text-center text-muted-foreground py-10">No appointments in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {apps.map(app => {
          if (!app.doctor) return null;
          return <AppointmentCard key={app.id} appointment={app} user={app.doctor} perspective="patient" />;
        })}
      </div>
    );
  };
  
  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
    </div>
  )

  return (
    <div className="container mx-auto">
      <PageHeader
        title="My Appointments"
        description="Review your upcoming and past appointments."
        icon={CalendarCheck}
      />
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
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
