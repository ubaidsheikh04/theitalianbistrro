import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
} from 'firebase-admin/app';

import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // Local development: use credentials from .env.local
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } else {
    // Firebase App Hosting: use the runtime service account
    initializeApp({
      credential: applicationDefault(),
    });
  }
}

const db = getFirestore(undefined, 'theitalianbistrro');

export { db };