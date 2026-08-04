import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getWeekNumber } from '@/utils/date';

const ordersFilePath = path.join(process.cwd(), 'orders.json');

async function readOrders() {
    try {
        const fileContents = await fs.readFile(ordersFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

export async function GET() {
    const orders = await readOrders();

    const dailySales = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString('en-IN');
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        acc[date] = (acc[date] || 0) + orderTotal;
        return acc;
    }, {});

    const weeklySales = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        const weekLabel = `Week ${week}, ${year}`;
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        acc[weekLabel] = (acc[weekLabel] || 0) + orderTotal;
        return acc;
    }, {});

    const monthlySales = orders.reduce((acc, order) => {
        const month = new Date(order.createdAt).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        acc[month] = (acc[month] || 0) + orderTotal;
        return acc;
    }, {});

    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
        return sum + orderTotal;
    }, 0);

    const stats = {
        dailySales: Object.entries(dailySales).map(([date, sales]) => ({ date, sales })),
        weeklySales: Object.entries(weeklySales).map(([week, sales]) => ({ week, sales })),
        monthlySales: Object.entries(monthlySales).map(([month, sales]) => ({ month, sales })),
        totalRevenue: totalRevenue || 0,
        totalOrders: orders.length,
        orders, // Pass all orders for detailed view
    };

    return NextResponse.json(stats);
}
