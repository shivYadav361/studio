'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoctorCard } from '@/components/patient/doctor-card';
import { PageHeader } from '@/components/shared/page-header';
import { mockDoctors } from '@/lib/mock-data';
import type { Doctor } from '@/lib/types';
import { Stethoscope, Search } from 'lucide-react';

export default function PatientDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialization, setSpecialization] = useState('all');

  const specializations = useMemo(() => ['all', ...Array.from(new Set(mockDoctors.map(d => d.specialization)))], []);

  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter((doctor) => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = specialization === 'all' || doctor.specialization === specialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, specialization]);

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
    </div>
  );
}
