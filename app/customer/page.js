"use client";
import { useState, useEffect } from "react";

function MenuItem({ item, quantity, onIncrement, onDecrement }) {
  return (
    <div className="border border-gray-300 p-2.5 mb-2.5 flex justify-between items-center bg-[#f8f1e7] rounded-md">
      <div>
        <h3 className="m-0 font-[var(--font-playfair)]">{item.name}</h3>
        <p className="m-0">₹{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center">
        {quantity > 0 ? (
          <>
            <button onClick={() => onDecrement(item.id)} className="bg-gray-300 w-8 h-8 rounded-md text-lg font-bold">-</button>
            <span className="px-4 text-lg">{quantity}</span>
            <button onClick={() => onIncrement(item)} className="bg-gray-300 w-8 h-8 rounded-md text-lg font-bold">+</button>
          </>
        ) : (
          <button
            onClick={() => onIncrement(item)}
            className="bg-[#c89d7c] text-white px-4 py-2 rounded-md hover:bg-[#b38968] transition-colors"
          >
            Add to Order
          </button>
        )}
      </div>
    </div>
  );
}

function ConfirmationModal({ order, onConfirm, onCancel, total }) {
    const totalItems = order.reduce((acc, item) => acc + item.quantity, 0);
    const [tableNumber, setTableNumber] = useState("");
    const [isParcel, setIsParcel] = useState(false);

    const handleConfirm = () => {
        const finalTableNumber = isParcel ? "Parcel" : parseInt(tableNumber, 10);

        if (!isParcel && (isNaN(finalTableNumber) || finalTableNumber < 1 || finalTableNumber > 10)) {
            alert("Please enter a valid table number between 1 and 10.");
            return;
        }

        onConfirm(order, finalTableNumber);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#f8f1e7] p-8 rounded-lg shadow-lg max-w-sm w-full font-[var(--font-playfair)] text-[#333]">
                <h2 className="text-2xl font-bold mb-4 text-center">Confirm Your Order</h2>
                {order.map(item => (
                    <div key={item.id} className="flex justify-between py-1">
                        <span>{item.name} x {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <hr className="my-4 border-gray-400" />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total ({totalItems} items):</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
                <p className="text-right text-sm italic mt-1">*Exclusive of taxes</p>
                <div className="mt-4 flex items-center">
                  <input 
                    type="checkbox" 
                    id="parcel" 
                    checked={isParcel} 
                    onChange={(e) => setIsParcel(e.target.checked)} 
                    className="h-5 w-5 mr-2"
                  />
                  <label htmlFor="parcel" className="text-lg">Parcel</label>
                </div>
                <div className="mt-4">
                  <label htmlFor="tableNumber" className="block text-lg font-bold">Table Number</label>
                  <input 
                    type="number" 
                    id="tableNumber" 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)} 
                    className="w-full p-2 border border-gray-300 rounded-md mt-1"
                    disabled={isParcel}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onCancel}
                        className="mr-4 px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-[#c89d7c] text-white px-6 py-2 rounded-md hover:bg-[#b38968] transition-colors"
                    >
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CustomerPage() {
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  }, []);

  const handleIncrement = (item) => {
    setOrder(currentOrder => {
        const existingItem = currentOrder.find(i => i.id === item.id);
        if (existingItem) {
            return currentOrder.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
            return [...currentOrder, { ...item, quantity: 1 }];
        }
    });
  };

  const handleDecrement = (itemId) => {
    setOrder(currentOrder => {
        const itemToDecrement = currentOrder.find(i => i.id === itemId);
        if (itemToDecrement && itemToDecrement.quantity > 1) {
            return currentOrder.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
        } else {
            return currentOrder.filter(i => i.id !== itemId);
        }
    });
  };

  const handlePlaceOrder = (finalOrder, tableNumber) => {
    if (!tableNumber && tableNumber !== 0) { // Also check for 0 if it's a valid input
      alert("Please enter a table number or select Parcel.");
      return;
    }
    
    const itemsForAPI = finalOrder.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsForAPI,
        status: 'accepted',
        tableNumber: tableNumber
      }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(() => {
        alert('Order placed successfully!');
        setOrder([]);
        setShowConfirmation(false);
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    });
  };

  const orderTotal = order.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="p-5 bg-[#e9e3d9] min-h-screen font-[var(--font-playfair)]">
      <h1 className="text-center mb-8 text-4xl font-bold text-[#333]">Our Menu</h1>
      
      <div className="max-w-xl mx-auto pb-40">
        {menu.map((item) => (
          <MenuItem 
            key={item.id} 
            item={item} 
            quantity={order.find(i => i.id === item.id)?.quantity || 0}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        ))}
      </div>

      {order.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#333] text-white p-5 text-center">
          <button
            onClick={() => setShowConfirmation(true)}
            className="bg-[#c89d7c] text-white px-6 py-2 rounded-md hover:bg-[#b38968] transition-colors mt-4"
          >
            View Order
          </button>
        </div>
      )}

      {showConfirmation && (
        <ConfirmationModal 
            order={order}
            total={orderTotal}
            onConfirm={handlePlaceOrder}
            onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
