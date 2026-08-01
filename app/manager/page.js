"use client";
import { useState, useEffect } from "react";

export default function ManagerPage() {
  const [menu, setMenu] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  const addMenuItem = () => {
    // In a real app, you would send this to the server
    const newItem = { 
      id: Date.now(), // temporary id
      name: newItemName, 
      price: parseFloat(newItemPrice) 
    };
    setMenu([...menu, newItem]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const removeMenuItem = (itemId) => {
    // In a real app, you would send this to the server
    setMenu(menu.filter(item => item.id !== itemId));
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#e9e3d9", minHeight: "100vh", fontFamily: "'Playfair Display', serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Manager Dashboard</h1>

      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>Menu Management</h2>

        <div style={{ marginBottom: "2rem" }}>
          {menu.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #ccc" }}>
              <span>{item.name} - ${item.price.toFixed(2)}</span>
              <button onClick={() => removeMenuItem(item.id)}>Remove</button>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "#f8f1e7", padding: "20px", borderRadius: "5px" }}>
          <h3>Add New Menu Item</h3>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{ padding: "10px", width: "calc(100% - 22px)" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="number"
              placeholder="Item Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              style={{ padding: "10px", width: "calc(100% - 22px)" }}
            />
          </div>
          <button onClick={addMenuItem}>Add Item</button>
        </div>
      </div>
    </div>
  );
}
