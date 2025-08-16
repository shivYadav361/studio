
import type { Doctor, Patient, Appointment } from './types';

// This file is now for reference on data structure, but is not used by the app.
// Data is fetched from Firestore instead.
// You will need to add this data to your Firestore instance.

export const mockPatients: Patient[] = [
  {
    uid: 'patient1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'patient',
    phone: '123-456-7890',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    uid: 'patient2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'patient',
    phone: '098-765-4321',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
];

export const mockDoctors: Doctor[] = [
  {
    uid: 'doctor1',
    name: 'Dr. Alice Williams',
    email: 'alice.williams@medipoint.com',
    role: 'doctor',
    specialization: 'Cardiology',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTimes: [
      { time: '09:00 AM', available: true }, { time: '10:00 AM', available: false },
      { time: '11:00 AM', available: true }, { time: '01:00 PM', available: true },
      { time: '02:00 PM', available: false }, { time: '03:00 PM', available: true },
    ],
    bio: 'Dr. Williams has over 15 years of experience in cardiology and is a leading expert in heart-related conditions.',
    avatarUrl: 'https://placehold.co/128x128.png',
  },
  {
    uid: 'doctor2',
    name: 'Dr. Ben Carter',
    email: 'ben.carter@medipoint.com',
    role: 'doctor',
    specialization: 'Dermatology',
    availableDays: ['Tuesday', 'Thursday'],
     availableTimes: [
      { time: '09:00 AM', available: true }, { time: '10:00 AM', available: true },
      { time: '11:00 AM', available: true }, { time: '01:00 PM', available: false },
      { time: '02:00 PM', available: true }, { time: '03:00 PM', available: true },
    ],
    bio: 'Dr. Carter is a board-certified dermatologist specializing in both medical and cosmetic dermatology.',
    avatarUrl: 'https://placehold.co/128x128.png',
  },
  {
    uid: 'doctor3',
    name: 'Dr. Chloe Davis',
    email: 'chloe.davis@medipoint.com',
    role: 'doctor',
    specialization: 'Pediatrics',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
     availableTimes: [
      { time: '09:00 AM', available: true }, { time: '10:00 AM', available: true },
      { time: '11:00 AM', available: false }, { time: '01:00 PM', available: true },
      { time: '02:00 PM', available: true }, { time: '03:00 PM', available: true },
    ],
    bio: 'Dr. Davis is passionate about children\'s health and provides comprehensive care for infants, children, and adolescents.',
    avatarUrl: 'https://placehold.co/128x128.png',
  },
   {
    uid: 'doctor4',
    name: 'Dr. David Miller',
    email: 'david.miller@medipoint.com',
    role: 'doctor',
    specialization: 'Neurology',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTimes: [
      { time: '09:00 AM', available: false }, { time: '10:00 AM', available: true },
      { time: '11:00 AM', available: true }, { time: '01:00 PM', available: true },
      { time: '02:00 PM', available: true }, { time: '03:00 PM', available: false },
    ],
    bio: 'Dr. Miller specializes in disorders of the nervous system, including the brain, spinal cord, and nerves.',
    avatarUrl: 'https://placehold.co/128x128.png',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'appt1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    appointmentTime: '11:00 AM',
    symptoms: 'Chest pain and shortness of breath.',
    status: 'booked',
  },
  {
    id: 'appt2',
    patientId: 'patient2',
    doctorId: 'doctor2',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    appointmentTime: '10:00 AM',
    symptoms: 'Skin rash and itching on arms.',
    status: 'booked',
  },
  {
    id: 'appt3',
    patientId: 'patient1',
    doctorId: 'doctor3',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    appointmentTime: '02:00 PM',
    symptoms: 'Fever and cough for my child.',
    status: 'checked',
    doctorNotes: 'Prescribed amoxicillin. Follow up in one week if symptoms persist.',
  },
   {
    id: 'appt4',
    patientId: 'patient2',
    doctorId: 'doctor1',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    appointmentTime: '09:00 AM',
    symptoms: 'Follow-up consultation regarding blood pressure medication.',
    status: 'booked',
  },
];
