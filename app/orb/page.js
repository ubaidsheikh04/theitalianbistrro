'use client';
import { useState, useEffect } from 'react';

export default function OrbPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          const readyOrders = data.filter(order => order.status === 'completed');
          setOrders(readyOrders);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      backgroundColor: "#34495e", 
      color: "white", 
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "'Playfair Display', serif"
    }}>
      <h1 style={{ textAlign: "center", fontSize: "3rem", marginBottom: "2rem" }}>Ready Orders</h1>
      
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px"
      }}>
        {orders.map(order => (
          <div key={order.id} style={{ 
            backgroundColor: "#2c3e50", 
            padding: "20px", 
            borderRadius: "10px",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: "2rem" }}>Order #{order.id} is Ready</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
