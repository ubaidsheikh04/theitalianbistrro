import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    const { orderId } = await request.json();

    if (!orderId) {
        return NextResponse.json(
            { message: 'Order ID is required' },
            { status: 400 }
        );
    }

    try {
        const parcelRef = db.collection('tables').doc('Parcel');
        const orderRef = db.collection('orders').doc(orderId);

        await db.runTransaction(async (transaction) => {

            // READS FIRST
            const parcelDoc = await transaction.get(parcelRef);
            const orderDoc = await transaction.get(orderRef);

            if (!parcelDoc.exists) {
                throw new Error('Parcel table not found');
            }

            const parcelData = parcelDoc.data();
            const orderIds = parcelData.orderIds || [];

            // Order is already removed
            if (!orderIds.includes(orderId)) {
                return;
            }

            const orderTotal = orderDoc.exists
                ? Number(
                    orderDoc.data().total ||
                    orderDoc.data().totalBill ||
                    0
                )
                : 0;

            const currentTotal = Number(
                parcelData.totalBill || 0
            );

            const remainingOrderIds = orderIds.filter(
                id => id !== orderId
            );

            const newTotal = Math.max(
                0,
                currentTotal - orderTotal
            );

            // UPDATE PARCEL
            transaction.update(parcelRef, {
                orderIds: remainingOrderIds,
                totalBill: remainingOrderIds.length === 0
                    ? 0
                    : newTotal,
                occupied: remainingOrderIds.length > 0
            });
        });

        return NextResponse.json({
            message: 'Parcel order marked as paid successfully'
        });

    } catch (error) {

        console.error(
            'Failed to mark parcel order as paid:',
            error
        );

        return NextResponse.json(
            {
                message:
                    error.message ||
                    'Failed to process payment'
            },
            { status: 500 }
        );
    }
}