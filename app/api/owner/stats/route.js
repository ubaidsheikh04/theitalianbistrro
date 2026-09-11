import { NextResponse } from 'next/server';
import { db } from '@/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        // Sort orders by most recent first
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching orders from Firestore:", error);
        return [];
    }
}

export async function GET() {
    const orders = await readOrders();

    if (!orders.length) {
        return NextResponse.json({
            totalRevenue: 0,
            totalOrders: 0,
            totalItemsSold: 0,
            averageOrderValue: 0,
            dailySales: [],
            monthlySales: [],
            yearlySales: [],
            topMostOrderedItems: [],
            topRevenueGeneratingItems: [],
            orders: [],
        });
    }

    // Ensure all orders have a 'total' property for backward compatibility
    const ordersWithTotal = orders.map(order => {
        if (order.total === undefined || order.total === null) {
            const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const parcelCharge = order.parcelCharge || 0;
            return { ...order, total: itemsTotal + parcelCharge };
        }
        return order;
    });
    
    const totalRevenue = ordersWithTotal.reduce((sum, order) => sum + order.total, 0);

    const totalOrders = ordersWithTotal.length;

    const totalItemsSold = ordersWithTotal.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const dailySales = ordersWithTotal.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString('en-IN');
        if (!acc[date]) {
            acc[date] = { sales: 0, orderCount: 0 };
        }
        acc[date].sales += order.total;
        acc[date].orderCount += 1;
        return acc;
    }, {});

    const monthlySales = ordersWithTotal.reduce((acc, order) => {
        const month = new Date(order.createdAt).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = { sales: 0, orderCount: 0 };
        }
        acc[month].sales += order.total;
        acc[month].orderCount += 1;
        return acc;
    }, {});

    const yearlySales = ordersWithTotal.reduce((acc, order) => {
        const year = new Date(order.createdAt).getFullYear();
        if (!acc[year]) {
            acc[year] = { sales: 0, orderCount: 0 };
        }
        acc[year].sales += order.total;
        acc[year].orderCount += 1;
        return acc;
    }, {});

    const itemStats = ordersWithTotal.flatMap(order => order.items).reduce((acc, item) => {
        const key = item.name;
        if (!acc[key]) {
            acc[key] = { name: item.name, count: 0, revenue: 0 };
        }
        acc[key].count += item.quantity;
        acc[key].revenue += item.price * item.quantity;
        return acc;
    }, {});

    const itemStatsArray = Object.values(itemStats);
    const topMostOrderedItems = [...itemStatsArray].sort((a, b) => b.count - a.count).slice(0, 3);
    const topRevenueGeneratingItems = [...itemStatsArray].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const stats = {
        totalRevenue,
        totalOrders,
        totalItemsSold,
        averageOrderValue,
        dailySales: Object.entries(dailySales).map(([date, data]) => ({ date, ...data })),
        monthlySales: Object.entries(monthlySales).map(([month, data]) => ({ month, ...data })),
        yearlySales: Object.entries(yearlySales).map(([year, data]) => ({ year, ...data })),
        topMostOrderedItems,
        topRevenueGeneratingItems,
        orders: ordersWithTotal,
    };

    return NextResponse.json(stats);
}