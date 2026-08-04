import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { withLock } from '@/utils/lock';

const ordersFilePath = path.join(process.cwd(), 'orders.json');
const menuFilePath = path.join(process.cwd(), 'menu.json');
const tablesFilePath = path.join(process.cwd(), 'tables.json');

async function readData(filePath) {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function writeData(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
    const orders = await readData(ordersFilePath);
    return NextResponse.json(orders);
}

export async function POST(request) {
    const { items, status, tableNumber } = await request.json();

    return await withLock(tablesFilePath, async () => {
        const [orders, menu, tables] = await Promise.all([
            readData(ordersFilePath),
            readData(menuFilePath),
            readData(tablesFilePath)
        ]);

        const processedItems = items.map(item => {
            const menuItem = menu.find(m => m.id === item.id);
            return {
                id: item.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity
            };
        });

        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            createdAt: new Date().toISOString(),
            items: processedItems,
            status,
            tableNumber
        };

        orders.push(newOrder);

        const table = tables.find(t => t.number === tableNumber);
        if (table) {
            table.occupied = true;
            table.orderIds.push(newOrder.id);
            table.totalBill = (table.totalBill || 0) + newOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        }

        await Promise.all([
            writeData(ordersFilePath, orders),
            writeData(tablesFilePath, tables)
        ]);

        return NextResponse.json({ message: "Order placed successfully", order: newOrder });
    });
}
