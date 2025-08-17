
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

  const specializations = useMemo(() => {
    if (loading) return [];
    const uniqueSpecializations = new Set(doctors.map(d => d.specialization));
    return ['all', ...Array.from(uniqueSpecializations)];
  }, [doctors, loading]);

  const filteredDoctors = useMemo(() => {
    if (loading) return [];
    return doctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = specialization === 'all' || doctor.specialization === specialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, specialization, doctors, loading]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 rounded-lg border bg-card p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                 <div className="pt-4">
                    <Skeleton className="h-10 w-full" />
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
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
            />
        </div>
        <Select value={specialization} onValueChange={setSpecialization} disabled={loading || specializations.length <= 1}>
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
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-24 text-center">
                <h3 className="text-xl font-semibold tracking-tight">No Doctors Found</h3>
                <p className="text-muted-foreground">Please try adjusting your search or filter criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
