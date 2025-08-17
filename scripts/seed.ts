
import admin from 'firebase-admin';
import { mockDoctors, mockPatients, mockAppointments } from '../src/lib/mock-data';
import { Timestamp } from 'firebase/firestore';

// IMPORTANT: See scripts/README.md for how to set up and run this script.

try {
  // Path to your service account key file
  const serviceAccount = require('../service-account-key.json');

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  }
} catch (error) {
  console.error(
    'Error: Could not initialize Firebase Admin SDK. ' +
    'Make sure you have created a service-account-key.json file in the root directory. ' +
    'See scripts/README.md for instructions.'
  );
  process.exit(1);
}


const db = admin.firestore();

async function seedCollection(collectionName: string, data: any[], idKey = 'uid') {
  console.log(`Seeding ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  
  // Clear existing documents to prevent duplicates
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Cleared existing documents in ${collectionName}.`);

  // Add new documents
  const addPromises = data.map(item => {
    const docId = item[idKey];
    // Convert JS Date to Firestore Timestamp for appointments
    if (collectionName === 'appointments' && item.appointmentDate) {
        item.appointmentDate = Timestamp.fromDate(item.appointmentDate);
    }
    // Set document with specific ID
    return collectionRef.doc(docId).set(item);
  });
  await Promise.all(addPromises);
  console.log(`Successfully seeded ${data.length} documents into ${collectionName}.`);
}

async function main() {
  try {
    await seedCollection('doctors', mockDoctors, 'uid');
    await seedCollection('patients', mockPatients, 'uid');
    await seedCollection('appointments', mockAppointments, 'id');
    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

main();
