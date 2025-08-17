import Link from 'next/link';
import type { Appointment, Doctor, Patient } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Stethoscope, User, ArrowRight, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import React from 'react';

interface AppointmentCardProps {
  appointment: Appointment;
  perspective: 'patient' | 'doctor';
  user: Patient | Doctor;
  onCancel?: (appointmentId: string) => void;
}

export function AppointmentCard({ appointment, perspective, user, onCancel }: AppointmentCardProps) {
  const statusColors = {
    booked: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const isPast = new Date(appointment.appointmentDate) < new Date() && appointment.status !== 'booked';
  const canCancel = perspective === 'patient' && appointment.status === 'booked' && new Date(appointment.appointmentDate) >= new Date();

  return (
    <Card className={cn("overflow-hidden transition-shadow hover:shadow-md", (isPast || appointment.status === 'cancelled') && 'bg-muted/50')}>
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-lg">
            {perspective === 'patient' ? "Dr. " : ""}
            {user.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-sm">
            {perspective === 'patient' 
              ? <><Stethoscope className="h-4 w-4" /> {(user as Doctor).specialization}</>
              : <><User className="h-4 w-4" /> Patient</>
            }
          </CardDescription>
        </div>
        <Badge variant="outline" className={cn("capitalize", statusColors[appointment.status])}>
            {appointment.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary"/>
            <span className="font-medium text-foreground">{format(appointment.appointmentDate, 'PPP')}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary"/>
            <span className="font-medium text-foreground">{appointment.appointmentTime}</span>
        </div>
        <div className="col-span-2">
            <p className="text-muted-foreground"><strong>Symptoms:</strong> {appointment.symptoms}</p>
        </div>
        {appointment.status === 'completed' && appointment.doctorNotes && (
             <div className="col-span-2 mt-2 p-3 bg-secondary/50 rounded-md">
                <p className="font-semibold text-foreground">Doctor's Notes:</p>
                <p className="text-muted-foreground text-sm">{appointment.doctorNotes}</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-end">
          {perspective === 'doctor' && appointment.status !== 'completed' && (
            <Button asChild variant="outline" size="sm">
                <Link href={`/doctor/appointments/${appointment.id}`}>
                View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          )}
          {canCancel && onCancel && (
            <Button onClick={() => onCancel(appointment.id)} variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Appointment
            </Button>
          )}
      </CardFooter>
    </Card>
  );
}
