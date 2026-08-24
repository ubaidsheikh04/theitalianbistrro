'use client';
import { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});

  const fetchData = async () => {
    try {
      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/tables'),
        fetch('/api/menu'),
      ]);
      const ordersData = await ordersRes.json();
      const tablesData = await tablesRes.json();
      const menuData = await menuRes.json();
      setOrders(ordersData);
      setTables(tablesData.sort((a, b) => a.id - b.id));
      setMenu(menuData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `menu-items/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Image uploaded:", snapshot.metadata.fullPath);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Image URL:", downloadURL);

      if (editingItem) {
        setEditingItem(prev => ({ ...prev, image: downloadURL }));
      } else {
        setNewItemImage(downloadURL);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (uploading) {
      alert('Please wait for the image upload to finish.');
      return;
    }
    if (!newItemImage) {
      alert('Please upload an image first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName, price: Number(newItemPrice), category: newItemCategory, image: newItemImage }),
      });
      const data = await response.json();
      console.log('POST /api/menu:', response.status, data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save menu item');
      }
      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('');
      setNewItemImage('');
      setShowAddItemForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert(`Failed to save menu item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        console.log('Sending update request:', editingItem);
        const response = await fetch('/api/menu', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingItem),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update menu item');
        }
        setEditingItem(null);
        await fetchData();
    } catch (error) {
        console.error("Error updating menu item:", error);
        alert(`Failed to update menu item: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsDeleting(prev => ({ ...prev, [itemId]: true }));
    try {
      const response = await fetch(`/api/menu?id=${itemId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete menu item');
      }
      await fetchData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(`Failed to delete menu item: ${error.message}`);
    } finally {
      setIsDeleting(prev => ({ ...prev, [itemId]: false }));
    }
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
                  <p className="font-bold text-lg">Total Bill: ₹{(table.totalBill || 0).toFixed(2)}</p>
                  <div className="mt-2">
                    <h4 className="font-bold">Current Orders:</h4>
                    {orders
                      .filter(order => table.orderIds && table.orderIds.includes(order.id))
                      .map(order => (
                        <div key={order.id} className="mt-2 pl-4 border-l-2 border-gray-400">
                          <p className="font-semibold">Order #{order.orderNumber} - <span className="font-normal">{order.status}</span></p>
                          <ul className="list-disc list-inside text-sm">
                            {order.items.map((item, index) => (
                              <li key={index}>
                                {item.name} x {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item Name" className="p-2 border rounded-md" required />
                    <input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="Price" className="p-2 border rounded-md" required step="0.01" />
                    <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category" className="p-2 border rounded-md" required />
                    <input type="file" onChange={handleImageChange} className="p-2 border rounded-md" disabled={uploading} />
                  </div>
                  <button type="submit" className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors" disabled={uploading || isSubmitting}>
                    {uploading ? 'Uploading...' : (isSubmitting ? 'Adding...' : 'Add Item')}
                  </button>
                </form>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {menu.map(item => (
                <div key={item.id} className="bg-[#f8f1e7] p-4 rounded-lg shadow-md">
                  {editingItem && editingItem.id === item.id ? (
                    <form onSubmit={handleUpdateMenuItem}>
                        <img src={editingItem.image || '/placeholder.png'} alt={editingItem.name} className="w-full h-32 object-cover mb-4 rounded-md" />
                        <input type="text" value={editingItem.name} onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))} placeholder="Item Name" className="w-full p-2 border rounded-md mb-2" required />
                        <input type="number" value={editingItem.price} onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))} placeholder="Price" className="w-full p-2 border rounded-md mb-2" required step="0.01" />
                        <input type="text" value={editingItem.category} onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))} placeholder="Category" className="w-full p-2 border rounded-md mb-2" required />
                        <input type="file" onChange={handleImageChange} className="w-full p-2 border rounded-md mb-4" disabled={uploading} />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingItem(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600" disabled={uploading || isSubmitting}>
                              {uploading ? 'Uploading...' : (isSubmitting ? 'Saving...' : 'Save')}
                            </button>
                        </div>
                    </form>
                  ) : (
                    <div>
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-32 object-cover mb-4 rounded-md" />}
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p>₹{(item.price || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setEditingItem(item)} className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">Edit</button>
                            <button onClick={() => handleDeleteMenuItem(item.id)} className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors" disabled={isDeleting[item.id]}>
                              {isDeleting[item.id] ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
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
