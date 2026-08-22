import { Firestore } from '@google-cloud/firestore';

const db = new Firestore({
  projectId: 'paymentgateway-15602101-4c0a3',
  databaseId: 'theitalianbistrro'
});

export const getMenu = async () => {
  const snapshot = await db.collection('menu').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTables = async () => {
  const snapshot = await db.collection('tables').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getOrders = async () => {
    const snapshot = await db.collection('orders').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};