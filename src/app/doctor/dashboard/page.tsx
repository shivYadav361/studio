
'use client';

import { useMemo, useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { getAppointmentsForDoctor, getPatient } from '@/lib/firestore-service';
import { LayoutDashboard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Appointment, Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth.tsx';
import { isToday, isTomorrow, parseISO, startOfDay } from 'date-fns';
import { useLoader } from '@/hooks/use-loader';

interface PopulatedAppointment extends Appointment {
    patient: Patient | null;
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchAppointments = async () => {
        if (!user) return;
        setLoading(true);
        showLoader();
        try {
          const doctorAppointments = await getAppointmentsForDoctor(user.uid);

          const populatedAppointments = await Promise.all(
              doctorAppointments.map(async (app) => {
                  const patient = await getPatient(app.patientId);
                  return { ...app, patient };
              })
          );
          setAppointments(populatedAppointments);
        } catch (error) {
          console.error("Failed to fetch appointments:", error);
        } finally {
          setLoading(false);
          hideLoader();
        }
    }
    fetchAppointments();
  }, [user]);

  const { todayAppointments, tomorrowAppointments, futureAppointments, completedAppointments } = useMemo(() => {
    const sortedAppointments = appointments
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const upcoming = sortedAppointments.filter(a => a.status === 'booked');
    const completed = sortedAppointments.filter(a => a.status === 'completed').reverse();

    const today = upcoming.filter(a => isToday(a.appointmentDate));
    const tomorrow = upcoming.filter(a => isTomorrow(a.appointmentDate));
    const future = upcoming.filter(a => !isToday(a.appointmentDate) && !isTomorrow(a.appointmentDate));
    
    return { 
        todayAppointments: today, 
        tomorrowAppointments: tomorrow,
        futureAppointments: future,
        completedAppointments: completed 
    };
  }, [appointments]);

  const renderAppointmentsList = (apps: PopulatedAppointment[], emptyMessage: string) => {
    if (apps.length === 0) {
      return <p className="text-center text-muted-foreground py-6">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-4 py-4">
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
          {loading ? renderSkeleton() : (
            <Accordion type="single" defaultValue="today" collapsible>
                <AccordionItem value="today">
                    <AccordionTrigger className="text-lg font-semibold">Today ({todayAppointments.length})</AccordionTrigger>
                    <AccordionContent>
                        {renderAppointmentsList(todayAppointments, "No appointments scheduled for today.")}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tomorrow">
                    <AccordionTrigger className="text-lg font-semibold">Tomorrow ({tomorrowAppointments.length})</AccordionTrigger>
                    <AccordionContent>
                        {renderAppointmentsList(tomorrowAppointments, "No appointments scheduled for tomorrow.")}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="future">
                    <AccordionTrigger className="text-lg font-semibold">Future ({futureAppointments.length})</AccordionTrigger>
                    <AccordionContent>
                        {renderAppointmentsList(futureAppointments, "No other upcoming appointments.")}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {loading ? renderSkeleton() : renderAppointmentsList(completedAppointments, "No completed appointments yet.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
