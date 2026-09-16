import { NextResponse } from 'next/server';
import { db } from '@/database';

const convertTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    } else if (timestamp && timestamp._seconds) {
        // Handle cases where the timestamp is serialized with _seconds and _nanoseconds
        return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000).toISOString();
    }
    // If it's already a string or another format, return as is (or handle appropriately)
    return timestamp;
};

export async function GET() {
  try {
    const deletedOrdersSnapshot = await db.collection('deleted-orders').orderBy('deletedAt', 'desc').get();
    const deletedOrders = deletedOrdersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            deletedAt: convertTimestamp(data.deletedAt),
        };
    });
    return NextResponse.json(deletedOrders);
  } catch (error) {
    console.error('Error fetching deleted orders:', error);
    return new NextResponse(JSON.stringify({ message: 'Failed to fetch deleted orders' }), { status: 500 });
  }
}
