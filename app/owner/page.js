'use client';
import { useState, useEffect, useMemo } from 'react';

export default function OwnerPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('daily');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    const fetchData = () => {
        // Keep setLoading(true) only for the initial load
        if (!stats) {
            setLoading(true);
        }
        fetch('/api/owner/stats', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching owner stats:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData(); // Initial fetch

        const interval = setInterval(() => {
            fetchData();
        }, 600000); // Refresh every 10 minutes

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const salesData = useMemo(() => {
        if (!stats) return [];
        let data;
        if (timeframe === 'daily') data = stats.dailySales;
        else if (timeframe === 'monthly') data = stats.monthlySales;
        else data = stats.yearlySales;

        if (timeframe === 'daily') {
            return [...data].sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
        }
        return data;

    }, [stats, timeframe]);

    const filteredOrders = useMemo(() => {
        if (!selectedPeriod || !stats) return stats?.orders || [];
        
        if (timeframe === 'daily') {
            return stats.orders.filter(order => new Date(order.createdAt).toLocaleDateString('en-IN') === selectedPeriod.date);
        }
        if (timeframe === 'monthly') {
            return stats.orders.filter(order => new Date(order.createdAt).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) === selectedPeriod.month);
        }
        if (timeframe === 'yearly') {
            return stats.orders.filter(order => new Date(order.createdAt).getFullYear().toString() === selectedPeriod.year);
        }
        return stats.orders;
    }, [selectedPeriod, stats, timeframe]);


    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><div className="text-xl">Loading Dashboard...</div></div>;
    }

    if (!stats) {
        return <div className="flex justify-center items-center min-h-screen"><div className="text-xl">Could not load dashboard data.</div></div>;
    }

    const StatCard = ({ title, value }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-lg">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );

    const ItemListCard = ({ title, items, valueKey }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span>{item.name}</span>
                        <span className="font-semibold">
                            {valueKey === 'count' ? `${item.count} orders` : `₹${item.revenue.toFixed(2)}`}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );

    const OrderDetailModal = ({ order, onClose }) => {
        if (!order) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Order Details</h2>
                            <p className="text-gray-600">Order #{order.orderNumber || order.id}</p>
                            <p className="text-gray-500">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                        <button onClick={onClose} className="text-3xl font-light">&times;</button>
                    </div>
                    <div className="border-t pt-4">
                        <h3 class="text-lg font-semibold mb-2">Items Ordered</h3>
                        <ul>
                            {order.items.map(item => (
                                <li key={item.id} className="flex justify-between items-center py-2 border-b">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end font-bold text-xl mt-4">
                            Total: ₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-sans text-gray-800">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Owner Dashboard</h1>
                <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                    Refresh Data
                </button>
            </header>

            {/* Top Level Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} />
                <StatCard title="Total Orders" value={stats.totalOrders} />
                <StatCard title="Items Sold" value={stats.totalItemsSold} />
                <StatCard title="Avg. Order Value" value={`₹${stats.averageOrderValue.toFixed(2)}`} />
            </div>

            {/* Sales Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-2xl font-bold">Sales Performance</h2>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                        {['daily', 'monthly', 'yearly'].map(t => (
                            <button key={t} onClick={() => { setTimeframe(t); setSelectedPeriod(null); }} 
                                    className={`px-3 py-1 text-sm rounded-md capitalize ${timeframe === t ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-auto max-h-96">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                                <th className="py-2 capitalize">{timeframe}</th>
                                <th className="py-2 text-right">Orders</th>
                                <th className="py-2 text-right">Sales (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((item, index) => (
                                <tr key={index} onClick={() => setSelectedPeriod(item)} className="border-b hover:bg-gray-100 cursor-pointer">
                                    <td className="py-2">{item[timeframe.slice(0, -2)] || item.date || item.month || item.year}</td>
                                    <td className="py-2 text-right">{item.orderCount}</td>
                                    <td className="py-2 text-right">{item.sales.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Item Performance */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                 <ItemListCard title="Top 3 Most Ordered Items" items={stats.topMostOrderedItems} valueKey="count" />
                 <ItemListCard title="Top 5 Revenue-Generating Items" items={stats.topRevenueGeneratingItems} valueKey="revenue" />
            </div>
            
            {/* Order History */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Order History</h2>
                    {selectedPeriod && (
                        <button onClick={() => setSelectedPeriod(null)} className="text-blue-600 hover:underline">
                            Show All Orders
                        </button>
                    )}
                </div>
                <div className="overflow-auto max-h-[500px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Order ID</th>
                                <th className="py-2">Date & Time</th>
                                <th className="py-2">Items</th>
                                <th className="py-2 text-right">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-b hover:bg-gray-100 cursor-pointer">
                                    <td className="py-2">{order.orderNumber || order.id}</td>
                                    <td className="py-2">{new Date(order.createdAt).toLocaleString('en-IN')}</td>
                                    <td className="py-2">{order.items.map(i => i.name).join(', ')}</td>
                                    <td className="py-2 text-right">{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
}
