'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { mockDoctors } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, CalendarDays, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateRange } from "react-day-picker"

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const doctor = mockDoctors.find((d) => d.uid === params.id);
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');

  if (!doctor) {
    notFound();
  }

  const handleBooking = () => {
    if (!date || !selectedTime || !symptoms) {
      toast({
        title: 'Incomplete Information',
        description: 'Please select a date, time, and describe your symptoms.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Appointment Booked!',
      description: `Your appointment with ${doctor.name} is confirmed for ${date.toLocaleDateString()} at ${selectedTime}.`,
      action: <div className="p-2 rounded-full bg-green-500"><CheckCircle className="text-white" /></div>
    });
    setSelectedTime(null);
    setSymptoms('');
  };
  
  const today = new Date();
  const disabledDays: (Date | DateRange)[] = [
      { before: today }
  ];

  return (
    <div className="container mx-auto max-w-4xl">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-secondary/30 p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={doctor.avatarUrl} alt={doctor.name} data-ai-hint="doctor portrait" />
                    <AvatarFallback className="text-4xl">{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="pt-2">
                    <CardTitle className="text-3xl font-extrabold">{doctor.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-lg mt-1">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        {doctor.specialization}
                    </CardDescription>
                    <p className="mt-4 text-muted-foreground">{doctor.bio}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/> Availability</h3>
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={disabledDays}
                        className="rounded-md border"
                    />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/> Available Time Slots</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {doctor.availableTimes.map(slot => (
                            <Button 
                                key={slot.time} 
                                variant={selectedTime === slot.time ? 'default' : 'outline'}
                                disabled={!slot.available}
                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                className={cn(!slot.available && "text-muted-foreground line-through")}
                            >
                                {slot.time}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Book Your Appointment</h3>
                <div className="space-y-2">
                    <Label htmlFor="symptoms">Describe your symptoms</Label>
                    <Textarea 
                        id="symptoms" 
                        placeholder="e.g., I have a persistent cough and fever..." 
                        rows={5}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                </div>
                <Button onClick={handleBooking} className="w-full text-lg py-6" size="lg">Confirm Booking</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
