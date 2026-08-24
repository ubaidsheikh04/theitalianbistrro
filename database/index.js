
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e.stack);
  }
}

export const db = admin.firestore();
