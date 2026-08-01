"use client";
import { useState, useEffect } from "react";

export default function OwnerPage() {
  const [dailySales, setDailySales] = useState(0);
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = () => {
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
    <div className="p-7 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)]">
      <h1 className="text-center mb-12 text-4xl font-bold text-[#333]">Owner's Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
        <div className="bg-[#f8f1e7] p-6 rounded-lg shadow-md">
          <h2 className="border-b-2 border-[#333] pb-2.5 mb-5 text-2xl font-bold">Daily Sales</h2>
          <p className="text-4xl font-bold text-center">${dailySales.toFixed(2)}</p>
        </div>

        <div className="bg-[#f8f1e7] p-6 rounded-lg shadow-md">
          <h2 className="border-b-2 border-[#333] pb-2.5 mb-5 text-2xl font-bold">Popular Items</h2>
          <ul className="list-none p-0">
            {popularItems.map(item => (
              <li key={item.name} className="flex justify-between py-2 border-b border-gray-300">
                <span>{item.name}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#f8f1e7] p-6 rounded-lg shadow-md">
          <h2 className="border-b-2 border-[#333] pb-2.5 mb-5 text-2xl font-bold">Real-time Occupancy</h2>
          <p className="text-4xl font-bold text-center">75%</p> 
        </div>
      </div>
    </div>
  );
}
