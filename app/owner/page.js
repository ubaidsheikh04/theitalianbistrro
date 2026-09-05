'use client';
import { useState, useEffect } from 'react';

// Helper to get week number
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}


export default function OwnerPage() {
  console.log("OWNER PAGE EXECUTING");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('daily'); // daily, weekly, monthly
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    console.log("OWNER: useEffect START");

    fetch("/api/owner/stats")
        .then(res => {
            console.log("OWNER: API STATUS", res.status);
            return res.json();
        })
        .then(data => {
            console.log("OWNER: DATA RECEIVED", data);
            console.log("OWNER: dailySales", data?.dailySales);
            console.log("OWNER: weeklySales", data?.weeklySales);
            console.log("OWNER: monthlySales", data?.monthlySales);
            console.log("OWNER: orders count", data?.orders?.length);

            console.log("OWNER: dailySales TYPES",
                data?.dailySales?.map(x => ({
                    date: x.date,
                    sales: x.sales,
                    salesType: typeof x.sales
                }))
            );

            console.log("OWNER: weeklySales TYPES",
                data?.weeklySales?.map(x => ({
                    week: x.week,
                    sales: x.sales,
                    salesType: typeof x.sales
                }))
            );

            console.log("OWNER: monthlySales TYPES",
                data?.monthlySales?.map(x => ({
                    month: x.month,
                    sales: x.sales,
                    salesType: typeof x.sales
                }))
            );

            setStats(data);

            console.log("OWNER: setStats DONE");

            setLoading(false);

            console.log("OWNER: setLoading(false) DONE");
        })
        .catch(err => {
            console.error("OWNER: FETCH ERROR", err);
            setLoading(false);
        });
  }, []);

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    let orders = [];
    if (timeframe === 'daily') {
        orders = stats.orders.filter(order => new Date(order.createdAt).toLocaleDateString('en-IN') === period.date);
    } else if (timeframe === 'weekly') {
        orders = stats.orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const year = orderDate.getFullYear();
            const week = getWeekNumber(orderDate);
            return `Week ${week}, ${year}` === period.week;
        });
    } else if (timeframe === 'monthly') {
        orders = stats.orders.filter(order => new Date(order.createdAt).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) === period.month);
    }
    setFilteredOrders(orders);
  };


  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-xl">Loading stats...</div>
        </div>
    );
}

if (!stats) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-xl">Could not load stats.</div>
        </div>
    );
}

try {
    console.log("OWNER: STARTING DASHBOARD RENDER");

    const testDaily = stats.dailySales || [];
    const testWeekly = stats.weeklySales || [];
    const testMonthly = stats.monthlySales || [];
    const testOrders = stats.orders || [];

    console.log("OWNER: dailySales length:", testDaily.length);
    console.log("OWNER: weeklySales length:", testWeekly.length);
    console.log("OWNER: monthlySales length:", testMonthly.length);
    console.log("OWNER: orders length:", testOrders.length);

    console.log("OWNER: FIRST DAILY:", testDaily[0]);
    console.log("OWNER: FIRST WEEKLY:", testWeekly[0]);
    console.log("OWNER: FIRST MONTHLY:", testMonthly[0]);
    console.log("OWNER: FIRST ORDER:", testOrders[0]);

} catch (renderError) {
    console.error("OWNER: RENDER PREPARATION ERROR:", renderError);
}

return (
    <div style={{ padding: "40px", fontSize: "30px" }}>
        <h1>Owner Dashboard</h1>

        <p>Stats loaded successfully.</p>

        <p>
            Total Revenue: ₹{stats.totalRevenue}
        </p>

        <p>
            Total Orders: {stats.totalOrders}
        </p>

        <p>
            Daily Sales Records: {stats.dailySales?.length}
        </p>

        <p>
            Weekly Sales Records: {stats.weeklySales?.length}
        </p>

        <p>
            Monthly Sales Records: {stats.monthlySales?.length}
        </p>

        <p>
            Orders: {stats.orders?.length}
        </p>
    </div>
);
}
