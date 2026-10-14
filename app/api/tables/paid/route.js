import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    const { tableId } = await request.json();

    if (!tableId) {
        return NextResponse.json(
            { message: 'Table ID is required' },
            { status: 400 }
        );
    }

    try {
        const tableRef = db.collection('tables').doc(String(tableId));

        await db.runTransaction(async (transaction) => {
            // Read the table first.
            const tableDoc = await transaction.get(tableRef);

            if (!tableDoc.exists) {
                throw new Error('Table not found');
            }

            const orderIds = tableDoc.data().orderIds || [];

            // Read all associated orders before making any writes.
            const orderDocs = await Promise.all(
                orderIds.map(id =>
                    transaction.get(db.collection('orders').doc(id))
                )
            );

            // Mark the table's existing orders as paid.
            orderDocs.forEach(orderDoc => {
                if (orderDoc.exists) {
                    transaction.update(orderDoc.ref, {
                        status: 'paid'
                    });
                }
            });

            // Reset the table, preserving the existing payment behavior.
            transaction.update(tableRef, {
                occupied: false,
                totalBill: 0,
                orderIds: []
            });
        });

        return NextResponse.json({
            message: 'Table paid successfully'
        });
    } catch (error) {
        console.error('Failed to mark table as paid:', error);

        return NextResponse.json(
            { message: error.message || 'Payment failed' },
            { status: 500 }
        );
    }
}
