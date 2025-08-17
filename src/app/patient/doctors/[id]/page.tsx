
import { getDoctor, getDoctors } from '@/lib/firestore-service';
import type { Doctor } from '@/lib/types';
import { notFound } from 'next/navigation';
import { DoctorDetailClient } from './doctor-detail-client';


export async function generateStaticParams() {
    const doctors = await getDoctors({ activeOnly: true });
    return doctors.map((doctor) => ({
      id: doctor.uid,
    }));
}

export default async function DoctorDetailPage({ params }: { params: { id: string } }) {
  const doctor = await getDoctor(params.id);

  if (!doctor) {
    notFound();
  }

  return <DoctorDetailClient doctor={doctor} />;
}
