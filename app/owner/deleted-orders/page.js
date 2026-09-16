'use client';

import { useState, useEffect } from 'react';

export default function DeletedOrdersPage() {
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeletedOrders = async () => {
      try {
        const res = await fetch('/api/deleted-orders');
        if (!res.ok) {
          throw new Error('Failed to fetch deleted orders');
        }
        const data = await res.json();
        setDeletedOrders(data);
      } catch (error) {
        console.error('Error fetching deleted orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-5 md:p-10 bg-[#e9e3d9] min-h-screen text-[#333]">
        <h1 className="text-center mb-8 text-4xl font-bold">Deleted Orders</h1>
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-10 bg-[#e9e3d9] min-h-screen text-[#333] font-[var(--font-playfair)]">
      <h1 className="text-center mb-8 text-4xl font-bold">Deleted Orders</h1>
      <div className="max-w-7xl mx-auto">
        {deletedOrders.length === 0 ? (
          <p className="text-center">No deleted orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Order #{order.orderNumber}</h2>
                <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Deleted At:</strong> {new Date(order.deletedAt).toLocaleString()}</p>
                <h3 className="font-bold mt-2">Items:</h3>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <p className="font-bold mt-2">Total: ₹{order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
