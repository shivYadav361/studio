import type { StaticImageData } from "next/image";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  phone?: string;
  avatarUrl?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  availableDays: string[];
  availableTimes: { time: string, available: boolean }[];
  bio: string;
}

export interface Patient extends User {
  role: 'patient';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  symptoms: string;
  status: 'booked' | 'completed' | 'cancelled';
  doctorNotes?: string;
}
