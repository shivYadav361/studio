
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getAppointment, updateAppointment } from '@/lib/firestore-service';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Calendar, Clock, HeartPulse, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment, Patient } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  
  const [data, setData] = useState<{appointment: Appointment, patient: Patient | null} | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form state
  const [status, setStatus] = useState<'booked' | 'checked' | 'cancelled'>('booked');
  const [doctorNotes, setDoctorNotes] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
        setLoading(true);
        const result = await getAppointment(params.id);
        if(result) {
            setData(result);
            setStatus(result.appointment.status);
            setDoctorNotes(result.appointment.doctorNotes || '');
        }
        setLoading(false);
    }
    fetchAppointment();
  }, [params.id]);


  if (loading) {
    return <AppointmentDetailSkeleton />
  }

  if (!data || !data.appointment || !data.patient) {
    notFound();
  }

  const { appointment, patient } = data;
  
  const handleUpdate = async () => {
    setUpdating(true);
    try {
        await updateAppointment(appointment.id, status, doctorNotes);
        toast({
            title: "Appointment Updated",
            description: "The appointment details have been saved successfully.",
            action: <div className="p-2 rounded-full bg-green-500"><CheckCircle className="text-white" /></div>
        });
    } catch (error) {
        toast({
            title: 'Update Failed',
            description: 'Could not update the appointment. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setUpdating(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <PageHeader
        title="Appointment Details"
        description={`Manage appointment for ${patient.name}.`}
        icon={FileText}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Update Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-semibold">Appointment Status</Label>
                        <RadioGroup value={status} onValueChange={(val) => setStatus(val as any)} className="flex gap-4 pt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="booked" id="status-booked" />
                                <Label htmlFor="status-booked">Booked</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="checked" id="status-checked" />
                                <Label htmlFor="status-checked">Checked</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cancelled" id="status-cancelled" />
                                <Label htmlFor="status-cancelled">Cancelled</Label>
                            </div>
                        </RadioGroup>
                    </div>
                     <div>
                        <Label htmlFor="doctor-notes" className="font-semibold">Doctor's Notes</Label>
                        <Textarea 
                            id="doctor-notes" 
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                            placeholder="Add notes about the consultation..."
                            rows={6}
                        />
                     </div>
                     <Button onClick={handleUpdate} disabled={updating}>
                        {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {updating ? "Saving..." : "Save Changes"}
                     </Button>
                </CardContent>
            </Card>
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
                </div>
                <div>
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
}

