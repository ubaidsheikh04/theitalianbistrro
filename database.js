import { Firestore } from '@google-cloud/firestore';
import serviceAccount from './serviceAccountKey.json';

const db = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  databaseId: 'theitalianbistrro'
});

export { db };
