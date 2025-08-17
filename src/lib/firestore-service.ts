
'use client';

import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import type { Doctor, Patient, Appointment } from './types';
import { Timestamp } from 'firebase/firestore';


// NOTE: In a real app, you'd have auth and rules to secure this data.
// For now, we're fetching all data.

export async function getDoctors(): Promise<Doctor[]> {
    const doctorsCol = collection(db, 'doctors');
    const doctorSnapshot = await getDocs(doctorsCol);
    const doctorList = doctorSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Doctor));
    return doctorList;
}

export async function getDoctor(id: string): Promise<Doctor | null> {
    const docRef = doc(db, 'doctors', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as Doctor;
    } else {
        return null;
    }
}

export async function getPatients(): Promise<Patient[]> {
    const patientsCol = collection(db, 'patients');
    const patientSnapshot = await getDocs(patientsCol);
    const patientList = patientSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Patient));
    return patientList;
}

export async function getPatient(id: string): Promise<Patient | null> {
    const docRef = doc(db, 'patients', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as Patient;
    } else {
        return null;
    }
}

export async function getAppointmentsForDoctor(doctorId: string): Promise<Appointment[]> {
    const q = query(collection(db, "appointments"), where("doctorId", "==", doctorId));
    const appointmentSnapshot = await getDocs(q);
    const appointmentList = appointmentSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            appointmentDate: (data.appointmentDate as Timestamp).toDate(),
        } as Appointment
    });
    return appointmentList;
}

export async function getAppointmentsForPatient(patientId: string): Promise<Appointment[]> {
    const q = query(collection(db, "appointments"), where("patientId", "==", patientId));
    const appointmentSnapshot = await getDocs(q);
    const appointmentList = appointmentSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            appointmentDate: (data.appointmentDate as Timestamp).toDate(),
        } as Appointment
    });
    return appointmentList;
}

export async function getAppointment(id: string): Promise<{appointment: Appointment, patient: Patient | null} | null> {
    const docRef = doc(db, 'appointments', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const appointmentData = docSnap.data();
        const appointment = {
            id: docSnap.id,
            ...appointmentData,
            appointmentDate: (appointmentData.appointmentDate as Timestamp).toDate(),
        } as Appointment;

        const patient = await getPatient(appointment.patientId);

        return { appointment, patient };
    } else {
        return null;
    }
}

export async function updateAppointment(id: string, data: Partial<Pick<Appointment, 'status' | 'doctorNotes'>>): Promise<void> {
    const appointmentRef = doc(db, 'appointments', id);
    await updateDoc(appointmentRef, data);
}

export async function bookAppointment(doctorId: string, patientId: string, date: Date, time: string, symptoms: string): Promise<void> {
    await addDoc(collection(db, 'appointments'), {
        doctorId,
        patientId,
        appointmentDate: Timestamp.fromDate(date),
        appointmentTime: time,
        symptoms,
        status: 'booked',
        doctorNotes: ''
    });
}
