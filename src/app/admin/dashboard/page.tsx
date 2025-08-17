
'use client';

import React, { useState, useEffect } from 'react';
import { getDoctors } from '@/lib/firestore-service';
import type { Doctor } from '@/lib/types';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, Pencil } from 'lucide-react';
import { DoctorForm } from '@/components/admin/doctor-form';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    // Admin gets all doctors, active or not
    const fetchedDoctors = await getDoctors({ activeOnly: false });
    setDoctors(fetchedDoctors);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleFormSuccess = () => {
    fetchDoctors();
    setIsFormOpen(false);
    setSelectedDoctor(null);
  };

  const openNewDoctorForm = () => {
    setSelectedDoctor(null);
    setIsFormOpen(true);
  }

  const openEditDoctorForm = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Manage Doctors"
          description="Add, view, and manage doctor profiles."
          icon={Users}
        />
        <Button onClick={openNewDoctorForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Doctor List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                   <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={doctor.avatarUrl} />
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{doctor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doctor.specialization}</Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={doctor.isActive ?? true ? 'default' : 'destructive'} className={cn(doctor.isActive ?? true ? "bg-green-500" : "")}>
                         {doctor.isActive ?? true ? 'Active' : 'Inactive'}
                       </Badge>
                    </TableCell>
                    <TableCell>{doctor.email}</TableCell>
                     <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => openEditDoctorForm(doctor)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <DoctorForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        doctor={selectedDoctor}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
