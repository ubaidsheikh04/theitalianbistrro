'use client';
import { useState, useEffect } from 'react';

function Order({ order, markAsPreparing, markAsCompleted, markAsServed }) {
  return (
    <div className={`border border-gray-300 p-5 mb-5 rounded-md ${order.status === 'preparing' ? 'bg-yellow-100' : (order.status === 'completed' ? 'bg-green-100' : 'bg-[#f8f1e7]')}`}>
      <h3 className="font-[var(--font-playfair)] text-2xl font-bold">Order #{order.orderNumber}</h3>
      <p className="text-lg">Table: {order.tableNumber || 'Parcel'}</p>
      <p className="text-lg">Status: <span className="font-bold">{order.status}</span></p>
      <ul className="list-disc list-inside mt-2">
        {order.items.map((item, index) => (
          <li key={index} className="text-base">{item.name} x {item.quantity}</li>
        ))}
      </ul>
      <div className="mt-4">
        {order.status === 'accepted' && (
          <button
            onClick={() => markAsPreparing(order.id)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Mark as Preparing
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => markAsCompleted(order.id)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Mark as Completed
          </button>
        )}
        {order.status === 'completed' && (
          <button
            onClick={() => markAsServed(order.id)}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
          >
            Mark as Served
          </button>
        )}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        const activeOrders = data.filter(o => o.status === 'accepted' || o.status === 'preparing' || o.status === 'completed');
        setOrders(activeOrders);
      })
      .catch(error => console.error('Error fetching orders:', error));
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const updateOrderStatus = (orderId, status) => {
    fetch(`/api/orders/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    )
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      fetchOrders();
    })
    .catch(error => {
        console.error(`Error updating order status to ${status}:`, error);
        alert(`Failed to update order status. Please try again.`);
    });
  };

  const markAsPreparing = (orderId) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const markAsCompleted = (orderId) => {
    updateOrderStatus(orderId, 'completed');
  };

  const markAsServed = (orderId) => {
    updateOrderStatus(orderId, 'served');
  };

  return (
    <div className="p-5 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)]">
      <h1 className="text-center mb-8 text-4xl font-bold text-[#333]">Kitchen Orders</h1>
      
      <div className="max-w-2xl mx-auto">
        {orders.map((order) => (
          <Order key={order.id} order={order} markAsPreparing={markAsPreparing} markAsCompleted={markAsCompleted} markAsServed={markAsServed} />
        ))}
      </div>
    </div>
  );
}
