
import { NextResponse } from 'next/server';
import { db } from '@/database';

// Fetches orders from the Firestore 'orders' collection based on a date range.
async function getOrdersByDateRange(startDate, endDate) {
    try {
        const ordersCollection = db.collection('orders');
        const snapshot = await ordersCollection
            .where('createdAt', '>=', startDate)
            .where('createdAt', '<=', endDate)
            .get();

        if (snapshot.empty) {
            return [];
        }

        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching orders from Firestore:", error);
        return [];
    }
}

// This function processes a list of orders to generate detailed statistics.
function processOrdersForAnalytics(orders) {
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
    const totalItemsSold = ordersWithTotal.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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

    return {
        totalRevenue,
        totalOrders,
        totalItemsSold,
        averageOrderValue,
        topMostOrderedItems,
        topRevenueGeneratingItems,
        orders: ordersWithTotal,
    };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let startDate, endDate;

    if (date) {
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
    } else if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);
    } else {
        return new NextResponse(JSON.stringify({ message: "A 'date' or a 'from' and 'to' date range is required." }), { status: 400 });
    }

    const orders = await getOrdersByDateRange(startDate.toISOString(), endDate.toISOString());

    if (!orders.length) {
        return NextResponse.json({
            totalRevenue: 0,
            totalOrders: 0,
            totalItemsSold: 0,
            averageOrderValue: 0,
            topMostOrderedItems: [],
            topRevenueGeneratingItems: [],
            orders: [],
        });
    }

    const analytics = processOrdersForAnalytics(orders);

    return NextResponse.json(analytics);
}
