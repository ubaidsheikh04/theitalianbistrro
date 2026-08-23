'use client';
import { useState, useEffect } from 'react';

export default function ManagerPage() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = () => {
    fetch('/api/orders').then(res => res.json()).then(setOrders).catch(err => console.error("Error fetching orders:", err));
    fetch('/api/tables').then(res => res.json()).then(data => setTables(data.sort((a, b) => a.id - b.id))).catch(err => console.error("Error fetching tables:", err));
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
      if (res.ok) {
        fetchData();
      }
    })
    .catch(err => console.error("Error marking table as paid:", err));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editingItem) {
          setEditingItem({ ...editingItem, image: reader.result });
        } else {
          setNewItemImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newItemName, price: newItemPrice, category: newItemCategory, image: newItemImage }),
    })
    .then(res => {
      if (res.ok) {
        setNewItemName('');
        setNewItemPrice('');
        setNewItemCategory('');
        setNewItemImage('');
        setShowAddItemForm(false);
        fetchData();
      }
    })
    .catch(err => console.error("Error adding menu item:", err));
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
    })
    .then(res => {
        if (res.ok) {
            setEditingItem(null);
            fetchData();
        }
    })
    .catch(err => console.error("Error updating menu item:", err));
  };

  return (
    <div className="p-5 md:p-10 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)] text-[#333]">
      <h1 className="text-center mb-8 text-4xl font-bold">Manager's Dashboard</h1>
      
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Table Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map(table => (
            <div key={table.id} className={`p-4 rounded-lg shadow-md ${table.occupied ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-2`}>
              <h3 className="text-xl font-bold mb-2">Table {table.id} - {table.occupied ? 'Occupied' : 'Available'}</h3>
              {table.occupied && (
                <div>
                  <p className="font-bold text-lg">Total Bill: ₹{table.totalBill.toFixed(2)}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item Name" className="p-2 border rounded-md" required />
                    <input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Price" className="p-2 border rounded-md" required step="0.01" />
                    <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category" className="p-2 border rounded-md" required />
                    <input type="file" onChange={handleImageChange} className="p-2 border rounded-md" />
                  </div>
                  <button type="submit" className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Add Item</button>
                </form>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {menu.map(item => (
                <div key={item.id} className="bg-[#f8f1e7] p-4 rounded-lg shadow-md">
                  {editingItem && editingItem.id === item.id ? (
                    <form onSubmit={handleUpdateMenuItem}>
                        <img src={editingItem.image} alt={editingItem.name} className="w-full h-32 object-cover mb-4 rounded-md" />
                        <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} placeholder="Item Name" className="w-full p-2 border rounded-md mb-2" required />
                        <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} placeholder="Price" className="w-full p-2 border rounded-md mb-2" required step="0.01" />
                        <input type="text" value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} placeholder="Category" className="w-full p-2 border rounded-md mb-2" required />
                        <input type="file" onChange={handleImageChange} className="w-full p-2 border rounded-md mb-4" />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Save</button>
                        </div>
                    </form>
                  ) : (
                    <div>
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-32 object-cover mb-4 rounded-md" />}
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p>₹{item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <button onClick={() => setEditingItem(item)} className="mt-4 w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
