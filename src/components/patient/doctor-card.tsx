import Link from 'next/link';
import type { Doctor } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, CalendarDays } from 'lucide-react';

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center gap-4 bg-secondary/50 p-4">
        <Avatar className="h-16 w-16 border-2 border-background shadow-md">
          <AvatarImage src={doctor.avatarUrl} alt={`Dr. ${doctor.name}`} />
          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl font-bold">{doctor.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Stethoscope className="h-4 w-4" />
             <span>{doctor.specialization}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <p className="text-sm text-foreground line-clamp-3">{doctor.bio}</p>
        <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Available Days</h4>
            <div className="flex flex-wrap gap-2">
                {doctor.availableDays.map(day => (
                    <Badge key={day} variant="secondary" className="font-normal">{day}</Badge>
                ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/20 p-4">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/patient/doctors/${doctor.uid}`}>View Profile & Book</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
