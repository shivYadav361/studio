
'use client';

import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { Doctor, Patient, Appointment, User } from './types';
import { Timestamp } from 'firebase/firestore';


// NOTE: In a real app, you'd have auth and rules to secure this data.

export async function getUser(uid: string): Promise<User | null> {
    const patientDoc = await getDoc(doc(db, 'patients', uid));
    if (patientDoc.exists()) return { uid: patientDoc.id, ...patientDoc.data() } as Patient;

    const doctorDoc = await getDoc(doc(db, 'doctors', uid));
    if (doctorDoc.exists()) return { uid: doctorDoc.id, ...doctorDoc.data() } as Doctor;

    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) return { uid: adminDoc.id, ...adminDoc.data() } as User;

    return null;
}

export async function getUserRole(uid: string): Promise<'patient' | 'doctor' | 'admin' | null> {
    const user = await getUser(uid);
    return user?.role || null;
}


export async function createUserInFirestore(uid: string, name: string, email: string, role: 'patient' | 'doctor') {
    const collectionName = role === 'patient' ? 'patients' : 'doctors';
    const userDocRef = doc(db, collectionName, uid);

    let userData: Partial<Patient | Doctor> = {
        uid,
        name,
        email,
        role,
        avatarUrl: `https://placehold.co/100x100.png`,
    };

    if (role === 'doctor') {
        userData = {
            ...userData,
            specialization: 'General Medicine', // Default value
            bio: 'Newly registered doctor.', // Default value
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Default
            availableTimes: [
                { time: '09:00 AM', available: true }, { time: '10:00 AM', available: true },
                { time: '11:00 AM', available: true }, { time: '01:00 PM', available: true },
                { time: '02:00 PM', available: true }, { time: '03:00 PM', available: true },
            ],
            degree: 'MD',
            fees: 100,
            isActive: true,
        } as Partial<Doctor>;
    }

    await setDoc(userDocRef, userData);
}

export async function saveDoctor(doctorData: Omit<Doctor, 'uid' | 'role' | 'avatarUrl'> & { uid?: string, password?: string }) {
    let uid = doctorData.uid;

    if (!uid && doctorData.password) {
        // This flow is for creating a new user from the admin panel
        try {
            // This is a temporary auth instance to create the user without signing in the admin as that user
            const { getAuth: getAdminAuth, createUserWithEmailAndPassword: createAdminUser } = await import("firebase/auth");
            const tempAuth = getAdminAuth();
            const userCredential = await createAdminUser(tempAuth, doctorData.email, doctorData.password);
            uid = userCredential.user.uid;
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                throw new Error("A user with this email already exists in Firebase Authentication.");
            }
            throw e;
        }
    } else if (!uid) {
        throw new Error("Password is required to create a new doctor.");
    }
    
    const doctorDocRef = doc(db, 'doctors', uid);
    
    const dataToSave: Omit<Doctor, 'uid' | 'avatarUrl'> = {
        name: doctorData.name,
        email: doctorData.email,
        role: 'doctor',
        specialization: doctorData.specialization,
        bio: doctorData.bio,
        availableDays: doctorData.availableDays,
        availableTimes: doctorData.availableTimes,
        degree: doctorData.degree,
        fees: doctorData.fees,
        isActive: doctorData.isActive,
    };

    // Use a placeholder if avatarUrl isn't already set
    const existingDoc = await getDoc(doctorDocRef);
    const avatarUrl = existingDoc.exists() && existingDoc.data().avatarUrl 
        ? existingDoc.data().avatarUrl 
        : `https://placehold.co/128x128.png`;

    await setDoc(doctorDocRef, { ...dataToSave, avatarUrl }, { merge: true });
    return uid;
}


export async function getDoctors(options: { activeOnly?: boolean } = {}): Promise<Doctor[]> {
    const { activeOnly = false } = options;
    let doctorsQuery = query(collection(db, 'doctors'));

    if (activeOnly) {
        doctorsQuery = query(doctorsQuery, where("isActive", "==", true));
    }

    const doctorSnapshot = await getDocs(doctorsQuery);
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

export async function cancelAppointment(id: string): Promise<void> {
    const appointmentRef = doc(db, 'appointments', id);
    await updateDoc(appointmentRef, { status: 'cancelled' });
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
