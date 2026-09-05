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
    fetch('/api/owner/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching owner stats:", err);
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
    return <div className="flex justify-center items-center min-h-screen"><div className="text-xl">Loading stats...</div></div>;
  }

  if (!stats) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-xl">Could not load stats.</div></div>;
  }

  const renderSalesTable = () => {
    let data, keyName, header;
    if (timeframe === 'daily') {
      data = stats.dailySales.sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
      keyName = 'date';
      header = 'Date';
    } else if (timeframe === 'weekly') {
        data = stats.weeklySales;
        keyName = 'week';
        header = 'Week';
    } else {
      data = stats.monthlySales;
      keyName = 'month';
      header = 'Month';
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Sales</h2>
                <div className="flex space-x-2">
                    <button onClick={() => setTimeframe('daily')} className={`px-3 py-1 rounded-md text-sm ${timeframe === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Daily</button>
                    <button onClick={() => setTimeframe('weekly')} className={`px-3 py-1 rounded-md text-sm ${timeframe === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Weekly</button>
                    <button onClick={() => setTimeframe('monthly')} className={`px-3 py-1 rounded-md text-sm ${timeframe === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Monthly</button>
                </div>
            </div>
            <div className="overflow-auto max-h-96">
                <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                    <th className="py-2">{header}</th>
                    <th className="py-2 text-right">Sales (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {(data || []).map((item, index) => (
                    <tr key={index} className="border-b cursor-pointer hover:bg-gray-100" onClick={() => handlePeriodSelect(item)}>
                        <td className="py-2">{item[keyName]}</td>
                        <td className="py-2 text-right">{(item.sales || 0).toFixed(2)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    );
  };
  
  const renderDetailedView = () => {
    if (!selectedPeriod) return null;

    let periodLabel;
    if (timeframe === 'daily') periodLabel = selectedPeriod.date;
    else if (timeframe === 'weekly') periodLabel = selectedPeriod.week;
    else periodLabel = selectedPeriod.month;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Orders for {periodLabel}</h2>
                    <button onClick={() => setSelectedPeriod(null)} className="text-2xl font-bold">&times;</button>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Order Number</th>
                            <th className="py-2">Items</th>
                            <th className="py-2 text-right">Total (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="border-b">
                                <td className="py-2">{order.orderNumber || order.id}</td>
                                <td className="py-2">
                                    <ul className="list-disc pl-5">
                                        {order.items.map(item => (
                                            <li key={item.id}>{item.name} (x{item.quantity})</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="py-2 text-right">
                                    {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
  }

  return (
    <div className="p-5 md:p-10 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)] text-[#333]">
      <h1 className="text-center mb-8 text-4xl font-bold">Owner's Dashboard</h1>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
          <p className="text-lg"><strong>Total Revenue:</strong> ₹{(stats.totalRevenue || 0).toFixed(2)}</p>
          <p className="text-lg"><strong>Total Orders:</strong> {stats.totalOrders || 0}</p>
        </div>

        <div className="md:col-span-2">
            {renderSalesTable()}
        </div>
      </div>
      {renderDetailedView()}
    </div>
  );
}
