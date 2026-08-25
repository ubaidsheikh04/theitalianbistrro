'use client';
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';

function MenuItem({ item, onUpdateQuantity, quantity }) {
  return (
    <div className="bg-[#0b1f18] border border-[#315348] rounded-2xl p-6 flex items-center justify-between">
      <div className="flex items-center">
        <img src={item.image || '/placeholder.png'} alt={item.name} className="h-16 w-16 object-cover rounded-md mr-4" />
        <div>
          <h4 className="text-xl font-semibold">{item.name}</h4>
          {item.description && <p className="text-[#d7cdb9] mt-1">{item.description}</p>}
          <p className="text-[#f4b942] mt-2 font-bold">₹{item.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center">
        <button onClick={() => onUpdateQuantity(item, (quantity || 0) - 1)} className="bg-[#f4b942] text-[#102820] px-3 py-1 rounded-lg font-semibold">-</button>
        <span className="px-4 text-lg font-semibold">{quantity || 0}</span>
        <button onClick={() => onUpdateQuantity(item, (quantity || 0) + 1)} className="bg-[#f4b942] text-[#102820] px-3 py-1 rounded-lg font-semibold">+</button>
      </div>
    </div>
  );
}

function ConfirmationModal({ order, onConfirm, onCancel, total, tableNumber }) {
    const totalItems = order.reduce((acc, item) => acc + item.quantity, 0);
    const [isParcel, setIsParcel] = useState(false);

    const handleConfirm = () => {
        const finalTableNumber = isParcel ? "Parcel" : tableNumber;
        onConfirm(order, finalTableNumber);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#f8f1e7] p-8 rounded-lg shadow-lg max-w-sm w-full font-[var(--font-playfair)] text-[#333]">
                <h2 className="text-2xl font-bold mb-4 text-center">Confirm Your Order for Table {tableNumber}</h2>
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

function PostOrderModal({ onOk, onNotNow, orderId }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#f8f1e7] p-8 rounded-lg shadow-lg max-w-sm w-full font-[var(--font-playfair)] text-[#333]">
                <h2 className="text-2xl font-bold mb-4 text-center">Your order has been confirmed.</h2>
                {orderId && <p className="text-center font-bold text-xl">Your Order Number is: {orderId}</p>}
                <p className="text-center mt-4">Please share your experience with us.</p>
                <div className="flex justify-center items-center mt-6">
                    <button
                        onClick={onOk}
                        className="bg-[#c89d7c] text-white px-6 py-2 rounded-md hover:bg-[#b38968] transition-colors"
                    >
                        OK
                    </button>
                    <button
                        onClick={onNotNow}
                        className="ml-4 text-sm underline"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CustomerPage() {
  const [menu, setMenu] = useState({});
  const [order, setOrder] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPostOrderModal, setShowPostOrderModal] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);
  const params = useParams();
  const tableNumber = params.tableNumber;
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        const categorizedMenu = data.reduce((acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        }, {});
        setMenu(categorizedMenu);
        const initialExpandedState = Object.keys(categorizedMenu).reduce((acc, category) => {
            acc[category] = false;
            return acc;
        }, {});
        setExpanded(initialExpandedState);
      });
  }, []);

  const toggleCategory = (category) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleUpdateQuantity = (item, quantity) => {
    setOrder(currentOrder => {
      const existingItem = currentOrder.find(i => i.id === item.id);
      if (quantity <= 0) {
        return currentOrder.filter(i => i.id !== item.id);
      }
      if (existingItem) {
        return currentOrder.map(i => i.id === item.id ? { ...i, quantity } : i);
      } else {
        return [...currentOrder, { ...item, quantity: 1 }];
      }
    });
  };

  const handlePlaceOrder = (finalOrder, finalTableNumber) => {
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
        tableNumber: finalTableNumber
      }),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(errorData => {
          throw new Error(errorData.message || 'Failed to place order. Please try again.');
        });
      }
      return res.json();
    })
    .then((data) => {
        setConfirmedOrderId(data.order.id);
        setShowPostOrderModal(true);
        setOrder([]);
        setShowConfirmation(false);
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert(error.message);
    });
  };

  const getQuantity = (itemId) => {
    const item = order.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  const orderTotal = order.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-[#102820] text-[#eee7d5] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 pb-40">
        <div className="text-center mb-16">
          <div className="mb-8">
            <p className="text-2xl md:text-3xl text-[#eee7d5]">Welcome to</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white">The Italian Bistrro</h1>
          </div>
          <p className="text-[#f4b942] text-xl font-semibold">Food & Drinks</p>
          <h2 className="text-5xl md:text-6xl font-bold mt-4 text-[#eee7d5]">Our Menu for Table {tableNumber}</h2>
          <p className="mt-5 text-lg text-[#d7cdb9]">Authentic Italian Flavours</p>
        </div>

        <div className="space-y-12">
          {Object.keys(menu).map(category => (
            <div key={category}>
              <h3 
                className="text-3xl font-bold text-[#f4b942] mb-6 flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <span>{category}</span>
                <span>{expanded[category] ? '▼' : '▲'}</span>
              </h3>
              {expanded[category] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {menu[category].map(item => (
                    <MenuItem 
                      key={item.id} 
                      item={item} 
                      onUpdateQuantity={handleUpdateQuantity} 
                      quantity={getQuantity(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {order.length > 0 && (
        <div className="fixed bottom-8 left-0 right-0 bg-[#333] text-white p-5 text-center z-10">
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
            tableNumber={tableNumber}
        />
      )}

      {showPostOrderModal && (
        <PostOrderModal
            orderId={confirmedOrderId}
            onOk={() => {
                window.location.href = 'https://search.google.com/local/writereview?placeid=ChIJxQxs8EyPwDsRZ7rbnb1rBMc';
            }}
            onNotNow={() => {
                setShowPostOrderModal(false);
                setConfirmedOrderId(null);
            }}
        />
      )}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#102820] text-center py-2 text-sm text-[#d7cdb9] z-10">
        Designed by <a href="https://wa.me/9175282915" target="_blank" rel="noopener noreferrer" className="text-[#f4b942] hover:underline">ubaidSHEIKH</a>
      </footer>
    </div>
  );
}
