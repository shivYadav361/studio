
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getAppointment, updateAppointment, getAppointmentsForPatient, getDoctor } from '@/lib/firestore-service';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Calendar, Clock, HeartPulse, CheckCircle, Loader2, History, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment, Patient, Doctor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


interface PopulatedAppointment extends Appointment {
    doctor: Doctor | null;
}

export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  
  const [data, setData] = useState<{appointment: Appointment, patient: Patient | null} | null>(null);
  const [patientHistory, setPatientHistory] = useState<PopulatedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Form state
  const [doctorNotes, setDoctorNotes] = useState('');

  useEffect(() => {
    const fetchAppointmentData = async () => {
        setLoading(true);
        const result = await getAppointment(params.id);
        
        if(result) {
            setData(result);
            setDoctorNotes(result.appointment.doctorNotes || '');

            // Fetch patient history
            const history = await getAppointmentsForPatient(result.appointment.patientId);
            const populatedHistory = await Promise.all(
                history.map(async (app) => {
                    const doctor = await getDoctor(app.doctorId);
                    return { ...app, doctor };
                })
            );

            // Filter out the current appointment and sort by date
            const sortedHistory = populatedHistory
                .filter(a => a.id !== params.id)
                .sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime());
            
            setPatientHistory(sortedHistory);
        }
        setLoading(false);
    }
    fetchAppointmentData();
  }, [params.id]);


  if (loading) {
    return <AppointmentDetailSkeleton />
  }

  if (!data || !data.appointment || !data.patient) {
    notFound();
  }

  const { appointment, patient } = data;
  
  const handleUpdateNotes = async () => {
    setUpdating(true);
    try {
        await updateAppointment(appointment.id, { doctorNotes });
        toast({
            title: "Notes Updated",
            description: "The appointment notes have been saved successfully.",
            action: <div className="p-2 rounded-full bg-green-500"><CheckCircle className="text-white" /></div>
        });
    } catch (error) {
        toast({
            title: 'Update Failed',
            description: 'Could not update the notes. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setUpdating(false);
    }
  }

  const handleCompleteAppointment = async () => {
      setCompleting(true);
      try {
        await updateAppointment(appointment.id, { status: 'completed', doctorNotes });
        toast({
            title: "Appointment Completed",
            description: "This appointment has been marked as completed.",
        });
        // Refetch data to update UI
        const result = await getAppointment(params.id);
        if(result) setData(result);
      } catch (error) {
        toast({
            title: 'Action Failed',
            description: 'Could not mark the appointment as completed.',
            variant: 'destructive',
        });
      } finally {
        setCompleting(false);
      }
  }
  
  const isCompleted = appointment.status === 'completed';

  return (
    <div className="container mx-auto max-w-5xl">
      <PageHeader
        title="Appointment Details"
        description={`Manage appointment for ${patient.name}.`}
        icon={FileText}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Update Appointment</CardTitle>
                    {isCompleted && <CardDescription className='text-green-600 font-semibold'>This appointment has been completed.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-6">
                     <div>
                        <Label htmlFor="doctor-notes" className="font-semibold">Doctor's Notes / Prescription</Label>
                        <Textarea 
                            id="doctor-notes" 
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            placeholder="Add notes about the consultation, diagnosis, and prescription..."
                            rows={6}
                            disabled={isCompleted}
                        />
                     </div>
                     <div className="flex gap-4">
                        <Button onClick={handleUpdateNotes} disabled={updating || isCompleted}>
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {updating ? "Saving..." : "Save Notes"}
                        </Button>
                         <Button onClick={handleCompleteAppointment} disabled={completing || isCompleted} variant="secondary">
                            {completing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mark as Completed
                         </Button>
                     </div>
                </CardContent>
            </Card>
            <PatientHistory history={patientHistory} />
        </div>
        <div>
            <Card className="sticky top-24">
                <CardHeader className="text-center items-center">
                    <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage src={patient.avatarUrl} alt={patient.name} />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle>{patient.name}</CardTitle>
                    <CardDescription>{patient.email}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>{format(appointment.appointmentDate, 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{appointment.appointmentTime}</span>
                    </div>
                     <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><HeartPulse className="h-5 w-5 text-muted-foreground" />Symptoms</h4>
                        <p className="text-muted-foreground">{appointment.symptoms}</p>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function PatientHistory({ history }: { history: PopulatedAppointment[] }) {
    if (history.length === 0) return null;

    const statusColors = {
        booked: 'bg-blue-100 text-blue-800 border-blue-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-6 w-6" /> Patient's Past Visits</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {history.map(app => (
                        <AccordionItem value={app.id} key={app.id}>
                            <AccordionTrigger>
                                <div className='flex items-center justify-between w-full pr-4'>
                                    <div>
                                        <p className="font-semibold">{format(app.appointmentDate, 'PPP')} - {app.appointmentTime}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Stethoscope className='h-4 w-4' />
                                            {app.doctor?.name}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={cn("capitalize", statusColors[app.status])}>
                                        {app.status}
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2">
                                <p><strong>Symptoms:</strong> {app.symptoms}</p>
                                {app.doctorNotes && <p><strong>Doctor's Notes:</strong> {app.doctorNotes}</p>}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}

function AppointmentDetailSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div>
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
}
