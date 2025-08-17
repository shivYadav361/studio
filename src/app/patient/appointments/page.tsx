
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { AppointmentCard } from '@/components/shared/appointment-card';
import { getAppointmentsForPatient, getDoctor, cancelAppointment } from '@/lib/firestore-service';
import { CalendarCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

interface PopulatedAppointment extends Appointment {
    doctor: Doctor | null;
}

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for cancellation dialog
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);


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

  useEffect(() => {
    fetchAppointments();
  }, [user]);


  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    const sortedAppointments = appointments
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const upcoming = sortedAppointments.filter(a => a.status === 'booked');
    const past = sortedAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');
    
    return { upcomingAppointments: upcoming.reverse(), pastAppointments: past.reverse() };
  }, [appointments]);

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsAlertOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointmentId) return;

    try {
      await cancelAppointment(selectedAppointmentId);
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      // Refresh the list
      fetchAppointments(); 
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel the appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setSelectedAppointmentId(null);
    }
  };


  const renderAppointments = (apps: PopulatedAppointment[]) => {
    if (apps.length === 0) {
      return <p className="text-center text-muted-foreground py-10">No appointments in this category.</p>;
    }
    return (
      <div className="space-y-4">
        {apps.map(app => {
          if (!app.doctor) return null;
          return (
            <AppointmentCard 
                key={app.id} 
                appointment={app} 
                user={app.doctor} 
                perspective="patient"
                onCancel={handleCancelClick}
             />
          );
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

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
