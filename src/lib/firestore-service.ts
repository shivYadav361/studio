
'use client';

import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { Doctor, Patient, Appointment, User } from './types';
import { Timestamp } from 'firebase/firestore';


// NOTE: In a real app, you'd have auth and rules to secure this data.

export async function getUser(uid: string): Promise<User | null> {
    const patientDoc = await getDoc(doc(db, 'patients', uid));
    if (patientDoc.exists()) return { uid: patientDoc.id, ...patientDoc.data(), role: 'patient' } as User;

    const doctorDoc = await getDoc(doc(db, 'doctors', uid));
    if (doctorDoc.exists()) return { uid: doctorDoc.id, ...doctorDoc.data(), role: 'doctor' } as User;

    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) return { uid: adminDoc.id, ...adminDoc.data(), role: 'admin' } as User;

    return null;
}

export async function getUserRole(uid: string): Promise<'patient' | 'doctor' | 'admin' | null> {
    const user = await getUser(uid);
    return user?.role || null;
}


export async function createUserInFirestore(uid: string, name: string, email: string, role: 'patient') {
    const collectionName = 'patients';
    const userDocRef = doc(db, collectionName, uid);

    const userData: Partial<Patient> = {
        uid,
        name,
        email,
        role,
        avatarUrl: `https://placehold.co/100x100.png`,
    };

    await setDoc(userDocRef, userData);
}

// Function to create a new doctor (Auth user + Firestore doc)
export async function createDoctor(doctorData: Omit<Doctor, 'uid' | 'role' | 'avatarUrl'> & { password?: string }) {
    if (!doctorData.password) {
        throw new Error("Password is required to create a new doctor.");
    }

    // This is a temporary auth instance to create the user without signing in the admin as that user
    // This is a known workaround for a limitation in the Firebase Web SDK.
    const { initializeApp, deleteApp } = await import('firebase/app');
    const { getAuth: getAdminAuth, createUserWithEmailAndPassword: createAdminUser } = await import("firebase/auth");
    
    // Create a temporary, uniquely named app instance to avoid conflicts
    const tempAppName = `temp-auth-app-${Date.now()}`;
    const tempApp = initializeApp(auth.app.options, tempAppName);
    const tempAuth = getAdminAuth(tempApp);

    let uid;
    try {
        const userCredential = await createAdminUser(tempAuth, doctorData.email, doctorData.password);
        uid = userCredential.user.uid;

        const doctorDocRef = doc(db, 'doctors', uid);
        
        const dataToSave: Omit<Doctor, 'uid' | 'avatarUrl' | 'role'> & {role: 'doctor'} = {
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

        await setDoc(doctorDocRef, { ...dataToSave, avatarUrl: `https://placehold.co/128x128.png` });

    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            throw new Error("A user with this email already exists in Firebase Authentication.");
        }
        throw e;
    } finally {
        // Clean up the temporary app instance after successful creation or on error
        await deleteApp(tempApp);
    }
    
    return uid;
}


// Function to update an existing doctor
export async function saveDoctor(doctorData: Omit<Doctor, 'role' | 'avatarUrl'> & { uid: string }) {
    const { uid, ...data } = doctorData;
    const doctorDocRef = doc(db, 'doctors', uid);
    
    // We only update fields that can be changed from the form, leaving email and role untouched.
    const dataToSave: Partial<Omit<Doctor, 'uid' | 'email' | 'role' | 'avatarUrl'>> = {
        name: data.name,
        specialization: data.specialization,
        bio: data.bio,
        availableDays: data.availableDays,
        availableTimes: data.availableTimes,
        degree: data.degree,
        fees: data.fees,
        isActive: data.isActive,
    };

    await updateDoc(doctorDocRef, dataToSave);
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
