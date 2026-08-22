import { NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/database';

export async function POST(request) {
    const { tableId } = await request.json();
    const tableRef = doc(db, 'tables', tableId);

    try {
        await updateDoc(tableRef, {
            occupied: false,
            orderIds: [],
            totalBill: 0
        });
        return NextResponse.json({ message: 'Table marked as paid successfully' });
    } catch (error) {
        return new NextResponse(JSON.stringify({ message: 'Table not found' }), { status: 404 });
    }
}
