'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { mockAppointments, mockDoctors, mockPatients } from '@/lib/mock-data';
import { LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DoctorDashboardPage() {
  const currentDoctor = mockDoctors[0]; // Assuming doctor1 is logged in

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const userAppointments = mockAppointments
      .filter(a => a.doctorId === currentDoctor.uid)
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const now = new Date();
    const upcoming = userAppointments.filter(a => new Date(a.appointmentDate) >= now);
    const past = userAppointments.filter(a => new Date(a.appointmentDate) < now).reverse();
    
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [currentDoctor.uid]);

  const renderAppointments = (appointments: typeof mockAppointments) => {
    if (appointments.length === 0) {
      return <p className="text-center text-muted-foreground py-10">No appointments in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {appointments.map(app => {
          const patient = mockPatients.find(p => p.uid === app.patientId);
          if (!patient) return null;
          return <AppointmentCard key={app.id} appointment={app} user={patient} perspective="doctor" />;
        })}
      </div>
    );
  };
  
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
          {renderAppointments(upcomingAppointments)}
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          {renderAppointments(pastAppointments)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
