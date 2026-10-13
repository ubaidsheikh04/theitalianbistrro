
import { NextResponse } from 'next/server';
import { db } from '@/database';

export async function GET() {
    try {
        const tablesSnapshot = await db.collection('tables').get();
        const parcelsSnapshot = await db.collection('parcels').get();

        let orderIds = [];
        tablesSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.orderIds && data.orderIds.length > 0) {
                orderIds.push(...data.orderIds);
            }
        });

        parcelsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.orderIds && data.orderIds.length > 0) {
                orderIds.push(...data.orderIds);
            }
        });

        if (orderIds.length === 0) {
            return NextResponse.json([]);
        }

        // Firestore 'in' query has a limit of 10 items.
        // We need to batch the requests if there are more than 10 orderIds.
        const MAX_IN_QUERY_SIZE = 10;
        const batches = [];
        for (let i = 0; i < orderIds.length; i += MAX_IN_QUERY_SIZE) {
            const batch = orderIds.slice(i, i + MAX_IN_QUERY_SIZE);
            batches.push(
                db.collection('orders').where('__name__', 'in', batch).get()
            );
        }

        const orderSnapshots = await Promise.all(batches);

        const orders = [];
        orderSnapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                orders.push({ id: doc.id, ...doc.data() });
            });
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching manager orders:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
