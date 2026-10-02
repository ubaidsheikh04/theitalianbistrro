'use client';
import { useState, useEffect } from 'react';

export default function OwnerPage() {
    const [summaryStats, setSummaryStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [timeframe, setTimeframe] = useState('daily'); // daily, monthly, custom
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [customRange, setCustomRange] = useState({ from: '', to: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchSummaryStats = () => {
        if (!summaryStats) setLoadingSummary(true);
        fetch('/api/owner/stats', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setSummaryStats(data);
                setLoadingSummary(false);
            })
            .catch(err => {
                console.error("Error fetching summary stats:", err);
                setLoadingSummary(false);
            });
    };

    const fetchAnalytics = (queryParams) => {
        setLoadingAnalytics(true);
        const url = `/api/owner/analytics?${new URLSearchParams(queryParams).toString()}`;
        fetch(url, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setAnalytics(data);
                setLoadingAnalytics(false);
            })
            .catch(err => {
                console.error(`Error fetching analytics for timeframe:`, err);
                setLoadingAnalytics(false);
            });
    };

    useEffect(() => {
        fetchSummaryStats();
        // Initial fetch for the default view (daily)
        fetchAnalytics({ date: selectedDate });

        const summaryInterval = setInterval(fetchSummaryStats, 600000); // Refresh summary every 10 mins

        return () => clearInterval(summaryInterval);
    }, []);

    const handleTimeframeChange = (newTimeframe) => {
        setTimeframe(newTimeframe);
        setAnalytics(null);
        if (newTimeframe === 'daily') {
            fetchAnalytics({ date: selectedDate });
        } else if (newTimeframe === 'monthly') {
            const from = `${selectedMonth}-01`;
            const to = new Date(new Date(from).getFullYear(), new Date(from).getMonth() + 1, 0).toISOString().split('T')[0];
            fetchAnalytics({ from, to });
        }
        // For custom, the fetch is triggered by the button
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        if (timeframe === 'daily') {
            fetchAnalytics({ date: newDate });
        }
    };

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setSelectedMonth(newMonth);
        if (timeframe === 'monthly') {
            const from = `${newMonth}-01`;
            const to = new Date(new Date(from).getFullYear(), new Date(from).getMonth() + 1, 0).toISOString().split('T')[0];
            fetchAnalytics({ from, to });
        }
    };
    
    const handleCustomRangeSearch = () => {
        if (customRange.from && customRange.to) {
            fetchAnalytics(customRange);
        }
    }

    const StatCard = ({ title, value, isLoading }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-lg">{title}</h3>
            {isLoading ? <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse mt-1"></div> : <p className="text-3xl font-bold">{value}</p>}
        </div>
    );

    const ItemListCard = ({ title, items }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <ul>
                {(items || []).map((item, index) => (
                    <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span>{item.name}</span>
                        <span className="font-semibold">
                            {item.count ? `${item.count} sold` : `₹${item.revenue.toFixed(2)}`}
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
                        <h3 className="text-lg font-semibold mb-2">Items Ordered</h3>
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
                            {order.parcelCharge > 0 && (
                                <li className="flex justify-between items-center py-2 border-b">
                                    <p className="font-semibold">Parcel Charge</p>
                                    <p className="text-gray-800">₹{order.parcelCharge.toFixed(2)}</p>
                                </li>
                            )}
                        </ul>
                        <div className="flex justify-end font-bold text-xl mt-4">
                            Total: ₹{order.total.toFixed(2)}
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
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-2">All-Time Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Total Revenue" value={`₹${summaryStats && summaryStats.totalRevenue ? summaryStats.totalRevenue.toFixed(2) : '0.00'}`} isLoading={loadingSummary} />
                    <StatCard title="Total Orders" value={summaryStats && summaryStats.totalOrders ? summaryStats.totalOrders : '0'} isLoading={loadingSummary} />
                    <StatCard title="Avg. Order Value" value={`₹${summaryStats && summaryStats.averageOrderValue ? summaryStats.averageOrderValue.toFixed(2) : '0.00'}`} isLoading={loadingSummary} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-2xl font-bold">Detailed Analytics</h2>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <button onClick={() => handleTimeframeChange('daily')} className={`px-3 py-1 text-sm rounded-md ${timeframe === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Daily</button>
                        <button onClick={() => handleTimeframeChange('monthly')} className={`px-3 py-1 text-sm rounded-md ${timeframe === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Monthly</button>
                        <button onClick={() => handleTimeframeChange('custom')} className={`px-3 py-1 text-sm rounded-md ${timeframe === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Custom</button>
                    </div>
                </div>

                <div className="mb-4">
                    {timeframe === 'daily' && <input type="date" value={selectedDate} onChange={handleDateChange} className="p-2 border rounded-md" />}
                    {timeframe === 'monthly' && <input type="month" value={selectedMonth} onChange={handleMonthChange} className="p-2 border rounded-md" />}
                    {timeframe === 'custom' && (
                        <div className="flex items-center space-x-2">
                            <input type="date" value={customRange.from} onChange={e => setCustomRange({...customRange, from: e.target.value})} className="p-2 border rounded-md" />
                            <span>to</span>
                            <input type="date" value={customRange.to} onChange={e => setCustomRange({...customRange, to: e.target.value})} className="p-2 border rounded-md" />
                            <button onClick={handleCustomRangeSearch} className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700">Search</button>
                        </div>
                    )}
                </div>

                {loadingAnalytics && <div className="text-center py-4">Loading analytics...</div>}

                {!loadingAnalytics && analytics && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <StatCard title="Revenue" value={`₹${analytics && analytics.totalRevenue ? analytics.totalRevenue.toFixed(2) : '0.00'}`} />
                            <StatCard title="Orders" value={analytics && analytics.totalOrders ? analytics.totalOrders : '0'} />
                            <StatCard title="Items Sold" value={analytics && analytics.totalItemsSold ? analytics.totalItemsSold : '0'} />
                            <StatCard title="Avg. Order Value" value={`₹${analytics && analytics.averageOrderValue ? analytics.averageOrderValue.toFixed(2) : '0.00'}`} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                             <ItemListCard title="Top 3 Ordered Items" items={analytics.topMostOrderedItems} />
                             <ItemListCard title="Top 5 Revenue Items" items={analytics.topRevenueGeneratingItems} />
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Orders</h2>
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
                                        {analytics.orders.map(order => (
                                            <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-b hover:bg-gray-100 cursor-pointer">
                                                <td className="py-2">{order.orderNumber || order.id}</td>
                                                <td className="py-2">{new Date(order.createdAt).toLocaleString('en-IN')}</td>
                                                <td className="py-2 truncate max-w-xs">{order.items.map(i => i.name).join(', ')}</td>
                                                <td className="py-2 text-right">{order.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </div>
    );
}
