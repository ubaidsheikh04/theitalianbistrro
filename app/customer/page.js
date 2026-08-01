"use client";
import { useState, useEffect } from "react";

function MenuItem({ item, addToOrder }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f8f1e7",
      borderRadius: "5px",
    }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
        <p style={{ margin: 0 }}>${item.price.toFixed(2)}</p>
      </div>
      <button onClick={() => addToOrder(item)}>Add to Order</button>
    </div>
  );
}

export default function CustomerPage() {
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this from a database
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  const addToOrder = (item) => {
    setOrder([...order, item]);
  };

  const placeOrder = () => {
    // In a real app, you would send this to the server
    alert(`Order placed!\n${order.map(i => i.name).join(", ")}`);
    setOrder([]);
  };

  const orderTotal = order.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={{ padding: "20px", backgroundColor: "#e9e3d9", minHeight: "100vh", fontFamily: "'Playfair Display', serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Our Menu</h1>
      
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {menu.map((item) => (
          <MenuItem key={item.id} item={item} addToOrder={addToOrder} />
        ))}
      </div>

      {order.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#333",
          color: "white",
          padding: "20px",
          textAlign: "center"
        }}>
          <h2>Your Order</h2>
          <p>Total: ${orderTotal.toFixed(2)}</p>
          <button onClick={placeOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
}
