import { NextResponse } from 'next/server';
import { db } from '@/database';

export async function GET() {
    try {
        const ordersCollection = db.collection('orders');
        const snapshot = await ordersCollection
            .where('status', '==', 'completed')
            .get();

        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const orders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            orders.push({
                id: doc.id,
                orderNumber: data.orderNumber,
                status: data.status
            });
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders from Firestore:", error);
        return new NextResponse(
            JSON.stringify({ message: "Error fetching orders from Firestore" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
