
import { NextResponse } from 'next/server';
import { db } from '@/database';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
    const { orderId } = await request.json();

    if (!orderId) {
        return new NextResponse(JSON.stringify({ message: "Order ID is required" }), { status: 400 });
    }

    try {
        const parcelTableRef = db.collection('tables').doc('parcel');

        await db.runTransaction(async (transaction) => {
            const parcelTableDoc = await transaction.get(parcelTableRef);
            if (!parcelTableDoc.exists) {
                // This should not happen if there are parcel orders, but it's good practice to handle it.
                return;
            }

            const parcelTableData = parcelTableDoc.data();

            // Find the order to get its total
            const orderRef = db.collection('orders').doc(orderId);
            const orderDoc = await transaction.get(orderRef);
            
            // Even if the order is not found (e.g., already deleted), we proceed to remove its ID from the parcel table.
            const orderTotal = orderDoc.exists ? orderDoc.data().total || 0 : 0;

            const newTotalBill = (parcelTableData.totalBill || 0) - orderTotal;
            
            const newOrderIds = parcelTableData.orderIds.filter(id => id !== orderId);

            const updateData = {
                orderIds: newOrderIds,
                totalBill: newTotalBill < 0 ? 0 : newTotalBill,
            };

            if (newOrderIds.length === 0) {
                updateData.occupied = false;
            }
            
            transaction.update(parcelTableRef, updateData);
        });

        return NextResponse.json({ message: "Parcel order marked as paid successfully" });
    } catch (error) {
        console.error('Failed to mark parcel order as paid:', error);
        return new NextResponse(JSON.stringify({ message: `Failed to process payment: ${error.message}` }), { status: 500 });
    }
}
