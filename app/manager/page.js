'use client';
import { useState, useEffect } from 'react';

export default function ManagerPage() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const fetchData = () => {
    fetch('/api/orders').then(res => res.json()).then(setOrders).catch(err => console.error("Error fetching orders:", err));
    fetch('/api/tables').then(res => res.json()).then(setTables).catch(err => console.error("Error fetching tables:", err));
    fetch('/api/menu').then(res => res.json()).then(setMenu).catch(err => console.error("Error fetching menu:", err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePaid = async (tableId) => {
    fetch('/api/tables/paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    })
    .then(res => {
      if (res.ok) fetchData();
      else console.error("Failed to mark table as paid");
    })
    .catch(err => console.error("Error marking table as paid:", err));
  };

  const handleDeleteMenuItem = async (itemId) => {
    fetch('/api/menu', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    })
    .then(res => {
      if (res.ok) setMenu(prevMenu => prevMenu.filter(item => item.id !== itemId));
    })
    .catch(err => console.error("Error deleting menu item:", err));
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItemName, price: newItemPrice }),
    })
    .then(res => {
      if (res.ok) {
        setNewItemName('');
        setNewItemPrice('');
        setShowAddItemForm(false);
        fetchData();
      }
    })
    .catch(err => console.error("Error adding menu item:", err));
  };

  return (
    <div className="p-5 md:p-10 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)] text-[#333]">
      <h1 className="text-center mb-8 text-4xl font-bold">Manager's Dashboard</h1>
      
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Table Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(table => (
            <div key={table.id} className={`p-4 rounded-lg shadow-md ${table.occupied ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-2`}>
              <h3 className="text-xl font-bold mb-2">Table {table.number} - {table.occupied ? 'Occupied' : 'Available'}</h3>
              {table.occupied && (
                <div>
                  <p className="font-bold text-lg">Total Bill: ₹{table.totalBill.toFixed(2)}</p>
                  <div className="mt-2">
                    <h4 className="font-semibold">Orders:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {table.orderIds.map(orderId => {
                        const order = orders.find(o => o.id === orderId);
                        return order ? (
                          <li key={order.id} className="mt-1">
                            Order #{order.id} ({order.status})
                            <ul className="list-disc pl-5">
                              {order.items.map(item => (
                                <li key={item.id}>{item.name} (x{item.quantity}) - ₹{(item.price * item.quantity).toFixed(2)}</li>
                              ))}
                            </ul>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                  <button onClick={() => handlePaid(table.id)} className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Mark as Paid</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10">
        <div onClick={() => setIsMenuExpanded(!isMenuExpanded)} className="cursor-pointer bg-[#f8f1e7] p-4 rounded-lg shadow-md flex justify-between items-center">
          <h2 className="text-3xl font-bold">Menu Management</h2>
          <span className="text-2xl font-bold">{isMenuExpanded ? '▲' : '▼'}</span>
        </div>
        {isMenuExpanded && (
          <div>
            <div className="mt-4">
              <button onClick={() => setShowAddItemForm(!showAddItemForm)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                {showAddItemForm ? 'Cancel' : 'Add New Item'}
              </button>
              {showAddItemForm && (
                <form onSubmit={handleAddMenuItem} className="mt-4 p-4 bg-white rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item Name" className="flex-grow p-2 border rounded-md" required />
                    <input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Price" className="p-2 border rounded-md" required step="0.01" />
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Add Item</button>
                  </div>
                </form>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {menu.map(item => (
                <div key={item.id} className="bg-[#f8f1e7] p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p>₹{item.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => handleDeleteMenuItem(item.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
