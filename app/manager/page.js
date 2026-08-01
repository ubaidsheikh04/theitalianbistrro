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
    const newItem = { 
      id: Date.now(),
      name: newItemName, 
      price: parseFloat(newItemPrice) 
    };
    setMenu([...menu, newItem]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const removeMenuItem = (itemId) => {
    setMenu(menu.filter(item => item.id !== itemId));
  };

  return (
    <div className="p-5 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)]">
      <h1 className="text-center mb-8 text-4xl font-bold text-[#333]">Manager Dashboard</h1>

      <div className="max-w-2xl mx-auto">
        <h2 className="border-b-2 border-[#333] pb-2.5 text-2xl font-bold">Menu Management</h2>

        <div className="mb-8">
          {menu.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-gray-300">
              <span>{item.name} - ${item.price.toFixed(2)}</span>
              <button
                onClick={() => removeMenuItem(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="bg-[#f8f1e7] p-5 rounded-md">
          <h3 className="text-xl font-bold mb-4">Add New Menu Item</h3>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Item Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="p-2.5 w-full rounded-md border border-gray-300"
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              placeholder="Item Price"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="p-2.5 w-full rounded-md border border-gray-300"
            />
          </div>
          <button
            onClick={addMenuItem}
            className="bg-[#c89d7c] text-white px-6 py-2 rounded-md hover:bg-[#b38968] transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
