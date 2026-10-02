
import { NextResponse } from 'next/server';
import { db } from '@/database';

// This endpoint has been refactored to use aggregation queries for performance.
// This avoids reading all order documents, significantly reducing costs.
// Detailed stats have been removed. A summary document strategy is recommended for those.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const ordersCollection = db.collection('orders');

        // Note: The following uses aggregation queries, which are available in modern
        // Firestore server-side SDKs. This is a highly efficient way to calculate statistics.
        const snapshot = await ordersCollection.aggregate({
          totalRevenue: db.AggregateField.sum('total'),
          totalOrders: db.AggregateField.count()
        }).get();

        const data = snapshot.data();
        const totalRevenue = data.totalRevenue;
        const totalOrders = data.totalOrders;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const stats = {
            totalRevenue,
            totalOrders,
            averageOrderValue,
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error("Error fetching stats with aggregation:", error);
        // Fallback for environments where aggregation is not supported
        return new NextResponse(JSON.stringify({ 
            message: "Failed to fetch stats, possibly due to an unsupported feature.",
            error: error.message
        }), { status: 500 });
    }
}
