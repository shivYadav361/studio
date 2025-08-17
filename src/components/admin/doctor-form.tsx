
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { saveDoctor } from '@/lib/firestore-service';
import type { Doctor } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const doctorFormSchema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').optional().or(z.literal('')),
  specialization: z.string().min(2, 'Specialization is required.'),
  degree: z.string().min(1, 'Degree is required.'),
  fees: z.coerce.number().min(0, 'Fees cannot be negative.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters.'),
  availableDays: z.array(z.string()).min(1, 'Select at least one available day.'),
  availableTimes: z.array(z.string()).min(1, 'Select at least one available time slot.'),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  doctor: Doctor | null;
  onSuccess: () => void;
}

export function DoctorForm({ isOpen, onOpenChange, doctor, onSuccess }: DoctorFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      specialization: '',
      degree: '',
      fees: 100,
      bio: '',
      availableDays: [],
      availableTimes: [],
    }
  });

  useEffect(() => {
    if (doctor) {
      reset({
        uid: doctor.uid,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        degree: doctor.degree,
        fees: doctor.fees,
        bio: doctor.bio,
        availableDays: doctor.availableDays,
        availableTimes: doctor.availableTimes.map(t => t.time),
      });
    } else {
      reset({
        name: '', email: '', password: '', specialization: '', degree: '', fees: 100, bio: '', availableDays: [], availableTimes: []
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: DoctorFormValues) => {
    setLoading(true);
    try {
        const doctorPayload = {
            ...data,
            availableTimes: data.availableTimes.map(time => ({ time, available: true })),
        };
        if (!doctor?.uid && !data.password) {
            toast({ title: 'Error', description: 'Password is required for new doctors.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        await saveDoctor(doctorPayload);
        toast({ title: 'Success', description: `Doctor ${doctor ? 'updated' : 'added'} successfully.` });
        onSuccess();
    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
          <DialogDescription>Fill in the details for the doctor profile.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
                {!doctor && (
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input id="specialization" {...register('specialization')} />
                    {errors.specialization && <p className="text-destructive text-sm">{errors.specialization.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input id="degree" {...register('degree')} />
                    {errors.degree && <p className="text-destructive text-sm">{errors.degree.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="fees">Consultation Fees ($)</Label>
                    <Input id="fees" type="number" {...register('fees')} />
                    {errors.fees && <p className="text-destructive text-sm">{errors.fees.message}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea id="bio" {...register('bio')} />
                    {errors.bio && <p className="text-destructive text-sm">{errors.bio.message}</p>}
                </div>
            </div>

            <div>
                <Label>Available Days</Label>
                <Controller
                    name="availableDays"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {availableDays.map(day => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`day-${day}`}
                                        checked={field.value?.includes(day)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, day])
                                                : field.onChange(field.value?.filter((value) => value !== day))
                                        }}
                                    />
                                    <Label htmlFor={`day-${day}`} className="font-normal">{day}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                />
                {errors.availableDays && <p className="text-destructive text-sm">{errors.availableDays.message}</p>}
            </div>

            <div>
                <Label>Available Times</Label>
                <Controller
                    name="availableTimes"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-5 gap-2 mt-2">
                            {availableTimes.map(time => (
                                <div key={time} className="flex items-center space-x-2">
                                     <Checkbox
                                        id={`time-${time}`}
                                        checked={field.value?.includes(time)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, time])
                                                : field.onChange(field.value?.filter((value) => value !== time))
                                        }}
                                    />
                                    <Label htmlFor={`time-${time}`} className="font-normal">{time}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                />
                 {errors.availableTimes && <p className="text-destructive text-sm">{errors.availableTimes.message}</p>}
            </div>

             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {doctor ? 'Save Changes' : 'Add Doctor'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
