import { NextResponse } from 'next/server';
import { db } from '@/database';

export async function POST(request) {
    const { tableId } = await request.json();

    if (!tableId) {
        return new NextResponse(JSON.stringify({ message: "Table ID is required" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const tableRef = db.collection('tables').doc(tableId);
        
        // Atomically update the table to mark it as available
        await tableRef.update({
            occupied: false,
            totalBill: 0,
            orderIds: []
        });

        return NextResponse.json({ message: "Table has been marked as paid and is now available." });
    } catch (error) {
        console.error('Failed to mark table as paid:', error);
        return new NextResponse(JSON.stringify({ message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
