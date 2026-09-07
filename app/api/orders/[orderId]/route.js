import { NextResponse } from 'next/server';
import { db } from '@/database';

export async function PUT(request, { params }) {
    const { orderId } = params;
    const { status } = await request.json();

    const orderRef = db.collection('orders').doc(orderId);
    await orderRef.update({ status });

    return NextResponse.json({ message: "Order status updated successfully" });
}

export async function DELETE(request, { params }) {
    const { orderId } = params;

    try {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.delete();
        return NextResponse.json({ message: "Order deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}
