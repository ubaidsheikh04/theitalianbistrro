import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  console.log('Firebase Admin configuration:');
  console.log('Project:', projectId);
  console.log('Client email:', clientEmail);
  console.log('Private key present:', !!privateKey);

  console.log('PRIVATE KEY DEBUG');
  console.log(
    'First 50:',
    JSON.stringify(privateKey?.substring(0, 50))
  );
  console.log(
    'Last 50:',
    JSON.stringify(privateKey?.substring(privateKey.length - 50))
  );
  console.log('Length:', privateKey?.length);
  console.log(
    'Starts:',
    privateKey?.startsWith('-----BEGIN PRIVATE KEY-----')
  );
  console.log(
    'Ends:',
    privateKey?.trim().endsWith('-----END PRIVATE KEY-----')
  );

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is missing');
  }

  if (!clientEmail) {
    throw new Error('FIREBASE_CLIENT_EMAIL is missing');
  }

  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY is missing');
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = getFirestore(undefined, 'theitalianbistrro');

export { db };