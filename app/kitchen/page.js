"use client";
import { useState, useEffect } from "react";

function Order({ order, markAsCompleted }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "20px",
      marginBottom: "20px",
      backgroundColor: "#f8f1e7",
      borderRadius: "5px",
    }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif" }}>Order #{order.id}</h3>
      <p>Table: {order.tableId || "Parcel"}</p>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
      <button onClick={() => markAsCompleted(order.id)}>Mark as Completed</button>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this from a database and use websockets for real-time updates
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data.filter(o => o.status === 'accepted')));
  }, []);

  const markAsCompleted = (orderId) => {
    // In a real app, you would update the order status in the database
    setOrders(orders.filter((order) => order.id !== orderId));
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#e9e3d9", minHeight: "100vh", fontFamily: "'Playfair Display', serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Kitchen Orders</h1>
      
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {orders.map((order) => (
          <Order key={order.id} order={order} markAsCompleted={markAsCompleted} />
        ))}
      </div>
    </div>
  );
}
