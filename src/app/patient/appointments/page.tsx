'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { mockAppointments, mockDoctors, mockPatients } from '@/lib/mock-data';
import { CalendarCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MyAppointmentsPage() {
  const currentPatient = mockPatients[0]; // Assuming patient1 is logged in

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const userAppointments = mockAppointments
      .filter(a => a.patientId === currentPatient.uid)
      .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
    
    const now = new Date();
    const upcoming = userAppointments.filter(a => new Date(a.appointmentDate) >= now);
    const past = userAppointments.filter(a => new Date(a.appointmentDate) < now);
    
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [currentPatient.uid]);

  const renderAppointments = (appointments: typeof mockAppointments) => {
    if (appointments.length === 0) {
      return <p className="text-center text-muted-foreground py-10">No appointments in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {appointments.map(app => {
          const doctor = mockDoctors.find(d => d.uid === app.doctorId);
          if (!doctor) return null;
          return <AppointmentCard key={app.id} appointment={app} user={doctor} perspective="patient" />;
        })}
      </div>
    );
  };
  
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
          {renderAppointments(upcomingAppointments)}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {renderAppointments(pastAppointments)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
