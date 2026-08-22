import { NextResponse } from 'next/server';
import { db } from '@/database'; // Correctly import the database instance
import { getWeekNumber } from '@/utils/date';

// Fetches all orders from the Firestore 'orders' collection
async function readOrders() {
    try {
        const ordersCollection = db.collection('orders');
        const snapshot = await ordersCollection.get();
        if (snapshot.empty) {
            return [];
        }
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (error) {
        console.error("Error fetching orders from Firestore:", error);
        return []; // Return an empty array on error
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
        orders, // Pass all orders with `orderNumber`
    };

    return NextResponse.json(stats);
}
