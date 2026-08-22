const { Firestore } = require('@google-cloud/firestore');
const serviceAccount = require('./serviceAccountKey.json');
const menu = require('./menu.json');

// Initialize Firestore client with the specific database
const db = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  databaseId: 'theitalianbistrro'
});


// Sample Data
const tables = Array.from({ length: 10 }, (_, i) => ({
    tableNumber: i + 1,
    occupied: false,
    orderIds: [],
    totalBill: 0
}));

// Function to clear a collection
const clearCollection = async (collectionName) => {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`Collection ${collectionName} is already empty.`);
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleared collection: ${collectionName}`);
};

// Function to seed data
const seedData = async () => {
    try {
        // Clear existing data
        await clearCollection('menu');
        await clearCollection('tables');

        // Seed Menu
        console.log('Seeding menu...');
        const menuPromises = menu.map(item => db.collection('menu').add(item));
        await Promise.all(menuPromises);
        console.log('Menu seeded successfully!');

        // Seed Tables
        console.log('Seeding tables...');
        const tablePromises = tables.map(table => db.collection('tables').doc(String(table.tableNumber)).set(table));
        await Promise.all(tablePromises);
        console.log('Tables seeded successfully!');

        console.log('Database seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

seedData();