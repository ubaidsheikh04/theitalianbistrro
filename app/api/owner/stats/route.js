import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const ordersCollection = db.collection('orders');
        const snapshot = await ordersCollection.aggregate({
          totalRevenue: db.AggregateField.sum('total'),
          totalOrders: db.AggregateField.count(),
        }).get();

        const data = snapshot.data();
        const totalRevenue = data.totalRevenue || 0;
        const totalOrders = data.totalOrders || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const stats = {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            // The detailed analytics are now fetched on demand from the /api/owner/analytics endpoint
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error("Error fetching summary stats:", error);
        return new NextResponse(JSON.stringify({ 
            message: "Failed to fetch summary stats.",
            error: error.message
        }), { status: 500 });
    }
}
