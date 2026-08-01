"use client";
import { useState, useEffect } from "react";

export default function OwnerPage() {
  const [dailySales, setDailySales] = useState(0);
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    const fetchDashboardData = () => {
      // Mock data for demonstration
      setDailySales(1250.75);
      setPopularItems([
        { name: "Espresso", count: 58 },
        { name: "Capuccino", count: 45 },
        { name: "Tiramisu", count: 25 },
      ]);
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={{ 
      padding: "30px", 
      backgroundColor: "#e9e3d9", 
      minHeight: "100vh", 
      fontFamily: "'Playfair Display', serif"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "3rem", fontSize: "2.5rem" }}>Owner's Dashboard</h1>

      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "30px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Daily Sales</h2>
          <p style={styles.cardValue}>${dailySales.toFixed(2)}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Popular Items</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {popularItems.map(item => (
              <li key={item.name} style={styles.listItem}>
                <span>{item.name}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Real-time Occupancy</h2>
          <p style={styles.cardValue}>75%</p> 
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#f8f1e7",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    borderBottom: "2px solid #333",
    paddingBottom: "10px",
    marginBottom: "20px",
    fontSize: "1.5rem"
  },
  cardValue: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    textAlign: "center"
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #ddd"
  }
};