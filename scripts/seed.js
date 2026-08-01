const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Note: You'll need to create this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const menuData = require('../menu.json');
const ordersData = require('../orders.json');

async function seedDatabase() {
  // Seed Menu
  const menuCollection = db.collection('menu');
  for (const item of menuData) {
    await menuCollection.doc(String(item.id)).set(item);
  }
  console.log('Menu data seeded!');

  // Seed Orders
  const ordersCollection = db.collection('orders');
  for (const order of ordersData) {
    await ordersCollection.doc(String(order.id)).set(order);
  }
  console.log('Orders data seeded!');
}

seedDatabase().catch(console.error);
