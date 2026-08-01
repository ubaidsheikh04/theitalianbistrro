import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  const jsonDirectory = path.join(process.cwd());
  const fileContents = await fs.readFile(jsonDirectory + '/orders.json', 'utf8');
  const orders = JSON.parse(fileContents);
  return NextResponse.json(orders);
}

export async function POST(request) {
    const jsonDirectory = path.join(process.cwd());
    const fileContents = await fs.readFile(jsonDirectory + '/orders.json', 'utf8');
    const orders = JSON.parse(fileContents);
    const { items, status, tableNumber } = await request.json();

    const newOrder = {
        id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        createdAt: new Date().toISOString(),
        items,
        status,
        tableNumber
    };

    orders.push(newOrder);
    await fs.writeFile(jsonDirectory + '/orders.json', JSON.stringify(orders, null, 2));
    return NextResponse.json({ message: "Order placed successfully", order: newOrder });
}
