import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function PUT(request, { params }) {
    const { orderId } = params;
    const { status } = await request.json();
    const jsonDirectory = path.join(process.cwd());
    const fileContents = await fs.readFile(jsonDirectory + '/orders.json', 'utf8');
    let orders = JSON.parse(fileContents);

    const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
    if (orderIndex === -1) {
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    orders[orderIndex].status = status;
    await fs.writeFile(jsonDirectory + '/orders.json', JSON.stringify(orders, null, 2));

    return NextResponse.json({ message: "Order status updated successfully", order: orders[orderIndex] });
}
