
import { getAppointmentsForDoctor } from '@/lib/firestore-service';
import { AppointmentDetailClient } from './appointment-detail-client';

// This function is required for static export of dynamic routes.
// We can't know all appointment IDs at build time, so we return an empty array.
// The page will still render correctly on the client side with dynamic data.
export async function generateStaticParams() {
    // We can't realistically pre-render all possible appointment pages.
    // We return an empty array, and Next.js will render these pages on-demand
    // on the client side.
    return [];
}

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  // The 'id' from the URL is passed to the client component
  return <AppointmentDetailClient id={params.id} />;
}
