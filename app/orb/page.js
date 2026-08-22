'use client';
import { useState, useEffect } from 'react';

export default function OrbPage() {
  const [orders, setOrders] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/orders')
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const text = await res.text();
          return text ? JSON.parse(text) : [];
        })
        .then((data) => {
          const readyOrders = data.filter(
            (order) => order.status === "completed"
          );
          setOrders(readyOrders);
        })
        .catch((err) => {
          console.error("Orders API failed:", err);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div style={{ 
      backgroundColor: "#34495e", 
      color: "white", 
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "'Playfair Display', serif"
    }}>
      <button 
        onClick={toggleFullScreen} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          padding: '10px',
          backgroundColor: '#2c3e50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'opacity 0.3s ease',
          opacity: isFullscreen ? (isHovered ? 1 : 0) : 1
        }}
      >
        {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
      </button>
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
            <h2 style={{ fontSize: "2rem" }}>Order #{order.orderNumber} is Ready</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
