'use client';

import { useState, useEffect } from 'react';

export default function OrbPage() {
  const [orders, setOrders] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const text = await res.text();

        const data = text ? JSON.parse(text) : [];

        const readyOrders = data.filter(
          (order) => order.status === 'completed'
        );

        setOrders(readyOrders);
      } catch (err) {
        console.error('Orders API failed:', err);
      }
    };

    // Fetch immediately when page opens
    fetchOrders();

    // Then refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);

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
    <div
      style={{
        backgroundColor: '#102820',
        color: '#eee7d5',
        minHeight: '100vh',
        padding: '30px',
        fontFamily: "'Playfair Display', serif"
      }}
    >
      <button
        onClick={toggleFullScreen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px',
          backgroundColor: '#0b1f18',
          color: '#eee7d5',
          border: '1px solid #315348',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'opacity 0.3s ease',
          opacity: isFullscreen
            ? isHovered
              ? 1
              : 0
            : 1
        }}
      >
        {isFullscreen
          ? 'Exit Fullscreen'
          : 'Go Fullscreen'}
      </button>

      <h1
        style={{
          textAlign: 'center',
          fontSize: '5rem',
          marginBottom: '2rem',
          color: '#f4b942'
        }}
      >
        Ready Orders
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '30px'
        }}
      >
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              backgroundColor: '#0b1f18',
              padding: '40px',
              borderRadius: '15px',
              textAlign: 'center',
              border: '2px solid #315348'
            }}
          >
            <h2 style={{ fontSize: '3rem', color: '#eee7d5' }}>
              Order #{order.orderNumber} is Ready
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
