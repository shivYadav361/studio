
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoctorCard } from '@/components/patient/doctor-card';
import { PageHeader } from '@/components/shared/page-header';
import { getDoctors } from '@/lib/firestore-service';
import type { Doctor } from '@/lib/types';
import { Stethoscope, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      // Only fetch active doctors for the patient view
      const fetchedDoctors = await getDoctors({ activeOnly: true });
      setDoctors(fetchedDoctors);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const specializations = useMemo(() => ['all', ...Array.from(new Set(doctors.map(d => d.specialization)))], [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = specialization === 'all' || doctor.specialization === specialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, specialization, doctors]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Find a Doctor"
        description="Search for and book appointments with our expert doctors."
        icon={Stethoscope}
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
        </div>
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec === 'all' ? 'All Specializations' : spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {loading ? renderSkeleton() : (
        <>
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.uid} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No doctors found matching your criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
