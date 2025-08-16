'use client';

import { notFound } from 'next/navigation';
import { mockAppointments, mockPatients } from '@/lib/mock-data';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, User, Calendar, Clock, HeartPulse, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';


export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const appointment = mockAppointments.find((a) => a.id === params.id);

  if (!appointment) {
    notFound();
  }

  const patient = mockPatients.find((p) => p.uid === appointment.patientId);

  if (!patient) {
    notFound();
  }
  
  const handleUpdate = () => {
    toast({
        title: "Appointment Updated",
        description: "The appointment details have been saved successfully.",
        action: <div className="p-2 rounded-full bg-green-500"><CheckCircle className="text-white" /></div>
    });
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
                        <RadioGroup defaultValue={appointment.status} className="flex gap-4 pt-2">
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
                            defaultValue={appointment.doctorNotes} 
                            placeholder="Add notes about the consultation..."
                            rows={6}
                        />
                     </div>
                     <Button onClick={handleUpdate}>Save Changes</Button>
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
