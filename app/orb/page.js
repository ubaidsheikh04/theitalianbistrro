"use client";
import { useState, useEffect } from "react";

function StatusPill({ status }) {
  const style = {
    padding: "5px 10px",
    borderRadius: "15px",
    color: "white",
    fontWeight: "bold",
  };

  switch (status) {
    case 'accepted':
      style.backgroundColor = '#3498db'; // Blue
      break;
    case 'preparing':
      style.backgroundColor = '#f1c40f'; // Yellow
      break;
    case 'ready':
      style.backgroundColor = '#2ecc71'; // Green
      break;
    default:
      style.backgroundColor = '#95a5a6'; // Gray
  }

  return <span style={style}>{status}</span>;
}

export default function OrbPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // In a real app, this would be a real-time subscription
    const interval = setInterval(() => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => setOrders(data));
    }, 2000); // Poll every 2 seconds

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
      <h1 style={{ textAlign: "center", fontSize: "3rem", marginBottom: "2rem" }}>Order Status Orb</h1>
      
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px"
      }}>
        {orders.map(order => (
          <div key={order.id} style={{ 
            backgroundColor: "#2c3e50", 
            padding: "20px", 
            borderRadius: "10px"
          }}>
            <h2 style={{ borderBottom: "1px solid #7f8c8d", paddingBottom: "10px" }}>Order #{order.id}</h2>
            <p>Table: {order.tableId || "Parcel"}</p>
            <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Status: <StatusPill status={order.status} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
