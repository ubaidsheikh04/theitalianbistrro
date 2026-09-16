import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';

const convertTimestamp = (timestamp) => {
    if (!timestamp) return timestamp;

    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString();
    }

    if (timestamp._seconds !== undefined) {
        return new Date(
            timestamp._seconds * 1000 +
            (timestamp._nanoseconds || 0) / 1000000
        ).toISOString();
    }

    return timestamp;
};

export async function GET() {
    try {
        // Get all deleted orders first
        const snapshot = await db
            .collection('deleted-orders')
            .get();

        console.log(
            'Deleted orders found:',
            snapshot.size
        );

        const deletedOrders = snapshot.docs.map(doc => {
            const data = doc.data();

            console.log(
                'Deleted order:',
                doc.id,
                data
            );

            return {
                id: doc.id,
                ...data,
                createdAt: convertTimestamp(data.createdAt),
                deletedAt: convertTimestamp(data.deletedAt),
            };
        });

        // Sort after reading so deletedAt indexing cannot cause problems
        deletedOrders.sort(
            (a, b) =>
                new Date(b.deletedAt) -
                new Date(a.deletedAt)
        );

        return NextResponse.json(deletedOrders);

    } catch (error) {
        console.error(
            'Error fetching deleted orders:',
            error
        );

        return NextResponse.json(
            {
                message: 'Failed to fetch deleted orders',
                error: error.message
            },
            { status: 500 }
        );
    }
}

