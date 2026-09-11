
import { NextResponse } from 'next/server';
import { db } from '@/database';

async function getMenu() {
    const menuCollection = db.collection('menu');
    const snapshot = await menuCollection.get();
    if (snapshot.empty) {
        return [];
    }
    const menu = [];
    snapshot.forEach(doc => {
        menu.push({
            ...doc.data(),
            id: doc.id,
        });
    });
    return menu;
}

export async function GET() {
    const ordersCollection = db.collection('orders');
    const snapshot = await ordersCollection.get();
    if (snapshot.empty) {
        return NextResponse.json([]);
    }
    const orders = [];
    snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json(orders);
}

export async function POST(request) {
    const { items, status, tableNumber } = await request.json();

    try {
        const menu = await getMenu();
        const processedItems = items.map(item => {
            const menuItem = menu.find(m => m.id === item.id);
            if (!menuItem) {
                throw new Error(`Menu item with id ${item.id} not found.`);
            }
            return {
                id: item.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity
            };
        });

        const counterRef = db.collection('counters').doc('orders');
        const newOrderRef = db.collection('orders').doc();
        let newOrderNumber;

        await db.runTransaction(async (transaction) => {
            // All reads must be executed before all writes.
            const counterDoc = await transaction.get(counterRef);
            const tableId = String(tableNumber);
            const tableRef = db.collection('tables').doc(tableId);
            const tableDoc = await transaction.get(tableRef);

            let lastOrderNumber = 0;
            if (counterDoc.exists && counterDoc.data().lastOrderNumber) {
                lastOrderNumber = counterDoc.data().lastOrderNumber;
            }
            newOrderNumber = lastOrderNumber + 1;

            let newTotalBill = processedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            let newOrderIds = [newOrderRef.id];

            if (tableDoc.exists) {
                const tableData = tableDoc.data();
                newTotalBill += tableData.totalBill;
                newOrderIds = [...tableData.orderIds, newOrderRef.id];
            }

            // Now, perform all write operations.
            transaction.set(newOrderRef, {
                orderNumber: newOrderNumber,
                createdAt: new Date().toISOString(),
                items: processedItems,
                status,
                tableNumber: tableId
            });

            transaction.set(counterRef, { lastOrderNumber: newOrderNumber }, { merge: true });

            if (tableDoc.exists) {
                transaction.update(tableRef, { occupied: true, totalBill: newTotalBill, orderIds: newOrderIds });
            } else {
                if (tableId.toLowerCase() === 'parcel') {
                    transaction.set(tableRef, { occupied: true, totalBill: newTotalBill, orderIds: newOrderIds });
                } else {
                    throw new Error("Table not found!");
                }
            }
        });

        return NextResponse.json({ message: "Order placed successfully", order: { id: newOrderNumber } });
    } catch (error) {
        console.error('Failed to place order:', error);
        return new NextResponse(JSON.stringify({ message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
