'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

export default function ManagerPage() {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);


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

  const [isPrinting, setIsPrinting] = useState(false);
  const [connectedPrinter, setConnectedPrinter] = useState(null);

  /* ============================================================
     FETCH DATA
  ============================================================ */

  const fetchOrdersAndTables = async () => {
    try {
      const [
        ordersRes,
        tablesRes,
      ] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/tables'),
      ]);

      const ordersData = await ordersRes.json();
      const tablesData = await tablesRes.json();

      setOrders(ordersData);

      setTables(
        tablesData.sort(
          (a, b) => Number(a.id) - Number(b.id)
        )
      );

    } catch (error) {
      console.error(
        'Error fetching orders and tables:',
        error
      );
    }
  };

  const fetchMenu = async () => {
    try {
      const menuRes = await fetch('/api/menu');
      const menuData = await menuRes.json();
      setMenu(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };


  useEffect(() => {
    fetchOrdersAndTables();
    fetchMenu();

    const interval = setInterval(
      fetchOrdersAndTables,
      10000
    );

    return () =>
      clearInterval(interval);
  }, []);

  /* ============================================================
     MARK TABLE PAID
  ============================================================ */

  const handlePaid = async (tableId) => {
    try {
      const response = await fetch(
        '/api/tables/paid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tableId
          })
        }
      );

      if (response.ok) {
        await fetchOrdersAndTables();
      }

    } catch (error) {
      console.error(
        'Error marking table as paid:',
        error
      );
    }
  };

  /* ============================================================
     IMAGE UPLOAD
  ============================================================ */

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const storageRef = ref(
        storage,
        `menu-items/${Date.now()}-${file.name}`
      );

      const snapshot = await uploadBytes(
        storageRef,
        file
      );

      console.log(
        'Image uploaded:',
        snapshot.metadata.fullPath
      );

      const downloadURL =
        await getDownloadURL(
          snapshot.ref
        );

      console.log(
        'Image URL:',
        downloadURL
      );

      if (editingItem) {
        setEditingItem(prev => ({
          ...prev,
          image: downloadURL
        }));
      } else {
        setNewItemImage(downloadURL);
      }

    } catch (error) {
      console.error(
        'Error uploading image:',
        error
      );

      alert(
        `Image upload failed: ${error.message}`
      );

    } finally {
      setUploading(false);
    }
  };

  /* ============================================================
     ADD MENU ITEM
  ============================================================ */

  const handleAddMenuItem = async (e) => {
    e.preventDefault();

    if (uploading) {
      alert(
        'Please wait for the image to finish uploading.'
      );
      return;
    }

    if (!newItemImage) {
      alert(
        'Please upload an image first.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        '/api/menu',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: newItemName,
            price: Number(newItemPrice),
            category: newItemCategory,
            image: newItemImage
          })
        }
      );

      const data = await response.json();

      console.log(
        'POST /api/menu:',
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Failed to save menu item'
        );
      }

      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('');
      setNewItemImage('');
      setShowAddItemForm(false);

      await fetchMenu();

    } catch (error) {
      console.error(
        'Error adding menu item:',
        error
      );

      alert(
        `Failed to save menu item: ${error.message}`
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     UPDATE MENU ITEM
  ============================================================ */

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      console.log(
        'Sending update request:',
        editingItem
      );

      const response = await fetch(
        '/api/menu',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editingItem)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Failed to update menu item'
        );
      }

      setEditingItem(null);

      await fetchMenu();

    } catch (error) {
      console.error(
        'Error updating menu item:',
        error
      );

      alert(
        `Failed to update menu item: ${error.message}`
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     DELETE MENU ITEM
  ============================================================ */

  const handleDeleteMenuItem = async (itemId) => {
    if (
      !confirm(
        'Are you sure you want to delete this item?'
      )
    ) {
      return;
    }

    setIsDeleting(prev => ({
      ...prev,
      [itemId]: true
    }));

    try {
      const response = await fetch(
        `/api/menu?id=${itemId}`,
        {
          method: 'DELETE'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Failed to delete menu item'
        );
      }

      await fetchMenu();

    } catch (error) {
      console.error(
        'Error deleting menu item:',
        error
      );

      alert(
        `Failed to delete menu item: ${error.message}`
      );

    } finally {
      setIsDeleting(prev => ({
        ...prev,
        [itemId]: false
      }));
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder({ ...order });
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder) return;

    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: editingOrder.items }),
      });

      if (response.ok) {
        setEditingOrder(null);
        await fetchOrdersAndTables();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Failed to update order: ${error.message}`);
    }
  };

  const handleDeleteOrderItem = (itemIndex) => {
    setEditingOrder(prevOrder => {
      const updatedItems = prevOrder.items.filter((_, index) => index !== itemIndex);
      return { ...prevOrder, items: updatedItems };
    });
  };

  const handleAddOrderItemToOrder = (menuItem) => {
    setEditingOrder(prevOrder => {
        const existingItem = prevOrder.items.find(item => item.id === menuItem.id);
        let updatedItems;
        if (existingItem) {
            updatedItems = prevOrder.items.map(item => 
                item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            updatedItems = [...prevOrder.items, { ...menuItem, quantity: 1 }];
        }
        return { ...prevOrder, items: updatedItems };
    });
  };

  const handleOrderItemQuantityChange = (itemIndex, newQuantity) => {
    setEditingOrder(prevOrder => {
      if (newQuantity <= 0) {
        const updatedItems = prevOrder.items.filter((_, index) => index !== itemIndex);
        return { ...prevOrder, items: updatedItems };
      }

      const updatedItems = prevOrder.items.map((item, index) => {
        if (index === itemIndex) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return { ...prevOrder, items: updatedItems };
    });
  };


  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEditingOrder(null);
        await fetchOrdersAndTables();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`Failed to delete order: ${error.message}`);
    }
  };

  /* ============================================================
     BLUETOOTH / ESC-POS HELPERS
  ============================================================ */

  const COMMON_PRINTER_SERVICES = [
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '000018f0-0000-1000-8000-00805f9b34fb',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    'e7810a71-73ae-499d-8c15-faa9e2c3f8c1'
  ];

  const textEncoder =
    new TextEncoder();

  const ESC = 0x1b;
  const GS = 0x1d;

  const CMD = {
    INIT: [
      ESC,
      0x40
    ],

    ALIGN_LEFT: [
      ESC,
      0x61,
      0x00
    ],

    ALIGN_CENTER: [
      ESC,
      0x61,
      0x01
    ],

    ALIGN_RIGHT: [
      ESC,
      0x61,
      0x02
    ],

    BOLD_ON: [
      ESC,
      0x45,
      0x01
    ],

    BOLD_OFF: [
      ESC,
      0x45,
      0x00
    ],

    DOUBLE_ON: [
      GS,
      0x21,
      0x11
    ],

    DOUBLE_OFF: [
      GS,
      0x21,
      0x00
    ],

    LINE_FEED: [
      0x0a
    ],

    CUT: [
      GS,
      0x56,
      0x00
    ]
  };

  const bytes = (...arrays) => {
    const result = [];

    for (const arr of arrays) {
      result.push(...arr);
    }

    return new Uint8Array(result);
  };

  const encodeText = (text) => {
    return textEncoder.encode(text);
  };

  /* ============================================================
     RECEIPT LINE
  ============================================================ */

  const receiptLine = (
    left,
    right
  ) => {
    const WIDTH = 32;

    left = String(left);
    right = String(right);

    if (
      left.length +
      right.length +
      1 >
      WIDTH
    ) {
      const maxLeft =
        WIDTH -
        right.length -
        1;

      left = left.substring(
        0,
        Math.max(
          1,
          maxLeft
        )
      );
    }

    const spaces =
      WIDTH -
      left.length -
      right.length;

    return (
      left +
      ' '.repeat(
        Math.max(
          1,
          spaces
        )
      ) +
      right +
      '\n'
    );
  };

  /* ============================================================
     CREATE ESC/POS RECEIPT
  ============================================================ */

  const createEscPosReceipt = (
    table
  ) => {
    const tableOrders =
      orders.filter(
        order =>
          table.orderIds &&
          table.orderIds.includes(
            order.id
          )
      );

    const dateTime =
      new Date().toLocaleString(
        'en-IN',
        {
          timeZone:
            'Asia/Kolkata',
          dateStyle:
            'short',
          timeStyle:
            'short'
        }
      );

    const output = [];

    // Initialize printer
    output.push(
      ...CMD.INIT
    );

    // Center
    output.push(
      ...CMD.ALIGN_CENTER
    );

    // Restaurant name
    output.push(
      ...CMD.BOLD_ON
    );

    output.push(
      ...CMD.DOUBLE_ON
    );

    output.push(
      ...encodeText(
        'THE ITALIAN BISTRRO\n'
      )
    );

    output.push(
      ...CMD.DOUBLE_OFF
    );

    output.push(
      ...CMD.BOLD_OFF
    );

    output.push(
      ...encodeText(
        `${dateTime}\n`
      )
    );

    output.push(
      ...encodeText(
        '--------------------------------\n'
      )
    );

    // Table
    output.push(
      ...CMD.ALIGN_LEFT
    );

    output.push(
      ...CMD.BOLD_ON
    );

    output.push(
      ...encodeText(
        `TABLE: ${table.id}\n`
      )
    );

    output.push(
      ...CMD.BOLD_OFF
    );

    output.push(
      ...encodeText(
        '--------------------------------\n'
      )
    );

    // Orders
    for (
      const order of tableOrders
    ) {
      output.push(
        ...CMD.BOLD_ON
      );

      output.push(
        ...encodeText(
          `ORDER #${order.orderNumber}\n`
        )
      );

      output.push(
        ...CMD.BOLD_OFF
      );

      output.push(
        ...encodeText(
          `Status: ${order.status}\n`
        )
      );

      output.push(
        ...encodeText(
          '\n'
        )
      );

      for (
        const item of order.items
      ) {
        const itemTotal =
          Number(
            item.price || 0
          ) *
          Number(
            item.quantity || 0
          );

        output.push(
          ...encodeText(
            receiptLine(
              `${item.name} x ${item.quantity}`,
              `Rs.${itemTotal.toFixed(2)}`
            )
          )
        );
      }

      output.push(
        ...encodeText(
          '--------------------------------\n'
        )
      );
    }

    // Total
    output.push(
      ...CMD.BOLD_ON
    );

    /*
     * FIX:
     * The original code was missing one closing
     * parenthesis here.
     */
    output.push(
      ...encodeText(
        receiptLine(
          'TOTAL BILL:',
          `Rs.${Number(
            table.totalBill || 0
          ).toFixed(2)}`
        )
      )
    );

    output.push(
      ...CMD.BOLD_OFF
    );

    output.push(
      ...encodeText(
        '--------------------------------\n'
      )
    );

    // Footer
    output.push(
      ...CMD.ALIGN_CENTER
    );

    output.push(
      ...encodeText(
        '\nThank You!!\n'
      )
    );

    output.push(
      ...encodeText(
        'Visit Again!\n'
      )
    );

    output.push(
      ...encodeText(
        '\n\n\n'
      )
    );

    // Cut
    output.push(
      ...CMD.CUT
    );

    return new Uint8Array(
      output
    );
  };

  /* ============================================================
     FIND WRITABLE CHARACTERISTIC
  ============================================================ */

  const findWritableCharacteristic =
    async (server) => {

      console.log(
        'Searching for printer services...'
      );

      for (
        const serviceUUID
        of COMMON_PRINTER_SERVICES
      ) {
        try {
          console.log(
            'Trying service:',
            serviceUUID
          );

          const service =
            await server.getPrimaryService(
              serviceUUID
            );

          console.log(
            'FOUND SERVICE:',
            serviceUUID
          );

          const characteristics =
            await service.getCharacteristics();

          for (
            const characteristic
            of characteristics
          ) {
            console.log(
              'Characteristic:',
              characteristic.uuid,
              characteristic.properties
            );

            if (
              characteristic.properties
                .writeWithoutResponse
            ) {
              return characteristic;
            }

            if (
              characteristic.properties
                .write
            ) {
              return characteristic;
            }
          }

        } catch (error) {
          console.log(
            'Service not available:',
            serviceUUID
          );
        }
      }

      /*
       * Attempt to inspect services that
       * Chrome allows.
       */
      try {
        const services =
          await server.getPrimaryServices();

        console.log(
          'Accessible Bluetooth services:',
          services
        );

        for (
          const service
          of services
        ) {
          console.log(
            'SERVICE:',
            service.uuid
          );

          const characteristics =
            await service.getCharacteristics();

          for (
            const characteristic
            of characteristics
          ) {
            console.log(
              'CHARACTERISTIC:',
              characteristic.uuid,
              characteristic.properties
            );

            if (
              characteristic.properties
                .writeWithoutResponse ||
              characteristic.properties
                .write
            ) {
              return characteristic;
            }
          }
        }

      } catch (error) {
        console.error(
          'Could not inspect services:',
          error
        );
      }

      return null;
    };

  /* ============================================================
     SEND DATA TO PRINTER
  ============================================================ */

  const sendToPrinter = async (
    characteristic,
    data
  ) => {

    const CHUNK_SIZE = 180;

    for (
      let i = 0;
      i < data.length;
      i += CHUNK_SIZE
    ) {
      const chunk =
        data.slice(
          i,
          Math.min(
            i + CHUNK_SIZE,
            data.length
          )
        );

      if (
        characteristic.properties
          .writeWithoutResponse
      ) {
        await characteristic.writeValueWithoutResponse(
          chunk
        );
      } else {
        await characteristic.writeValue(
          chunk
        );
      }

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            20
          )
      );
    }
  };

  /* ============================================================
     PRINT
  ============================================================ */

  const handlePrint = async (
    table
  ) => {

    const tableOrders =
      orders.filter(
        order =>
          table.orderIds &&
          table.orderIds.includes(
            order.id
          )
      );

    if (
      tableOrders.length === 0
    ) {
      alert(
        'No orders to print for this table.'
      );
      return;
    }

    if (
      !('bluetooth' in navigator)
    ) {
      alert(
        'Web Bluetooth is not available in this browser.\n\n' +
        'Please use Chrome or another Chromium browser ' +
        'with Bluetooth enabled.'
      );

      return;
    }

    setIsPrinting(true);

    let device = null;

    try {

      console.log(
        'Opening Bluetooth printer selector...'
      );

      device =
        await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,

          optionalServices:
            COMMON_PRINTER_SERVICES
        });

      console.log(
        'Selected Bluetooth device:',
        device.name
      );

      console.log(
        'Bluetooth device ID:',
        device.id
      );

      if (
        !device.gatt
      ) {
        throw new Error(
          'The selected device does not provide a GATT connection.'
        );
      }

      console.log(
        'Connecting to printer...'
      );

      const server =
        await device.gatt.connect();

      console.log(
        'Connected to:',
        device.name
      );

      setConnectedPrinter(
        device.name ||
        'Bluetooth Printer'
      );

      const characteristic =
        await findWritableCharacteristic(
          server
        );

      if (
        !characteristic
      ) {

        console.error(
          'No writable Bluetooth characteristic was found.'
        );

        alert(
          'MT580P2 was detected and connected, but its Bluetooth printing characteristic could not be found.\n\n' +
          'Open F12 → Console and check the Bluetooth service information.'
        );

        return;
      }

      console.log(
        'PRINT CHARACTERISTIC FOUND:',
        characteristic.uuid
      );

      console.log(
        'Properties:',
        characteristic.properties
      );

      const receiptData =
        createEscPosReceipt(
          table
        );

      console.log(
        'Receipt bytes:',
        receiptData.length
      );

      await sendToPrinter(
        characteristic,
        receiptData
      );

      console.log(
        'Receipt successfully sent to printer.'
      );

      alert(
        `Receipt printed successfully on ${
          device.name ||
          'MT580P2'
        }.`
      );

    } catch (error) {

      console.error(
        'Bluetooth printing error:',
        error
      );

      if (
        error.name ===
        'NotFoundError'
      ) {
        console.log(
          'Bluetooth printer selection cancelled.'
        );

        return;
      }

      if (
        error.name ===
        'SecurityError'
      ) {
        alert(
          'Chrome blocked access to the Bluetooth printer.\n\n' +
          'Make sure the page is running on HTTPS or localhost.'
        );

        return;
      }

      if (
        error.name ===
        'NetworkError'
      ) {
        alert(
          'Could not connect to MT580P2.\n\n' +
          'Make sure the printer is powered on and paired.'
        );

        return;
      }

      alert(
        `Could not print receipt.\n\n${error.message}`
      );

    } finally {
      setIsPrinting(false);
    }
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div
      className="
        p-5
        md:p-10
        bg-[#e9e3d9]
        min-h-screen
        font-[var(--font-playfair)]
        text-[#333]
      "
    >

      {/* HEADER */}

      <h1 className="text-center mb-8 text-4xl font-bold">
        Manager's Dashboard
      </h1>

      {/* PRINTER STATUS */}

      {connectedPrinter && (
        <div className="max-w-7xl mx-auto mb-5">
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
            Bluetooth printer connected:
            <strong className="ml-2">
              {connectedPrinter}
            </strong>
          </div>
        </div>
      )}

      {/* TABLE OVERVIEW */}

      <div className="max-w-7xl mx-auto">

        <h2 className="text-3xl font-bold mb-4">
          Table Overview
        </h2>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-6
          "
        >

          {tables.map(table => (

            <div
              key={table.id}
              className={`
                p-4
                rounded-lg
                shadow-md
                ${
                  table.occupied
                    ? 'bg-red-100 border-red-400'
                    : 'bg-green-100 border-green-400'
                }
                border-2
              `}
            >

              <h3 className="text-xl font-bold mb-2">
                Table {table.id} -{' '}
                {table.occupied
                  ? 'Occupied'
                  : 'Available'}
              </h3>

              {table.occupied && (

                <div>

                  <p className="font-bold text-lg">
                    Total Bill: ₹
                    {Number(
                      table.totalBill || 0
                    ).toFixed(2)}
                  </p>

                  <div className="mt-2">

                    <h4 className="font-bold">
                      Current Orders:
                    </h4>

                    {orders
                      .filter(
                        order =>
                          table.orderIds &&
                          table.orderIds.includes(
                            order.id
                          )
                      )
                      .map(order => (

                        <div
                          key={order.id}
                          className="
                            mt-2
                            pl-4
                            border-l-2
                            border-gray-400
                          "
                        >
                           <div className="flex items-center">
                            <p className="font-semibold">
                              Order #{order.orderNumber}
                              {' - '}
                              <span className="font-normal">
                                {order.status}
                              </span>
                            </p>
                            <button onClick={() => handleEditOrder(order)} className="text-blue-500 hover:text-blue-700 ml-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </div>

                          <ul
                            className="
                              text-sm
                            "
                          >

                            {order.items.map(
                              (
                                item,
                                index
                              ) => (

                                <li
                                  key={index}
                                  className="flex justify-between"
                                >
                                  <span>{item.name} x {item.quantity}</span>
                                  <span>₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                                </li>

                              )
                            )}

                          </ul>

                        </div>

                      ))}

                  </div>

                  <div className="flex gap-2 mt-4">

                    <button
                      onClick={() =>
                        handlePaid(
                          table.id
                        )
                      }
                      className="
                        w-full
                        bg-green-500
                        text-white
                        px-4
                        py-2
                        rounded-md
                        hover:bg-green-600
                        transition-colors
                      "
                    >
                      Mark as Paid
                    </button>

                    <button
                      onClick={() =>
                        handlePrint(
                          table
                        )
                      }
                      disabled={
                        isPrinting
                      }
                      className="
                        w-full
                        bg-blue-500
                        text-white
                        px-4
                        py-2
                        rounded-md
                        hover:bg-blue-600
                        transition-colors
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      {isPrinting
                        ? 'Printing...'
                        : 'Print'}
                    </button>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

      {editingOrder && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div className="bg-white p-5 rounded-lg shadow-xl m-4 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Order #{editingOrder.orderNumber}</h2>

            <div className="mb-4">
                <h3 className="text-lg font-semibold">Current Items</h3>
                <ul>
                    {editingOrder.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center mb-2">
                           <div class="flex items-center">
                              <span class="w-2/3">{item.name}</span>
                              <div class="flex items-center">
                                 <button onClick={() => handleOrderItemQuantityChange(index, item.quantity - 1)} class="px-2 py-1 border rounded-md">-</button>
                                 <span class="px-3">{item.quantity}</span>
                                 <button onClick={() => handleOrderItemQuantityChange(index, item.quantity + 1)} class="px-2 py-1 border rounded-md">+</button>
                              </div>
                           </div>
                           <button onClick={() => handleDeleteOrderItem(index)} className="text-red-500 hover:text-red-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                 <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                              </svg>
                           </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-semibold">Add Item</h3>
                <select onChange={(e) => handleAddOrderItemToOrder(JSON.parse(e.target.value))} className="w-full p-2 border rounded-md">
                    <option value="">Select an item</option>
                    {menu.map(item => (
                        <option key={item.id} value={JSON.stringify(item)}>
                            {item.name} - ₹{Number(item.price || 0).toFixed(2)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-4 mt-4">
                <button onClick={() => setEditingOrder(null)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                    Cancel
                </button>
                <button onClick={() => handleDeleteOrder(editingOrder.id)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                    Delete Order
                </button>
                <button onClick={handleUpdateOrder} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                    Update Order
                </button>
            </div>
        </div>
    </div>
)}


      {/* MENU MANAGEMENT */}

      <div className="max-w-7xl mx-auto mt-10">

        <div
          onClick={() =>
            setIsMenuExpanded(
              !isMenuExpanded
            )
          }
          className="
            cursor-pointer
            bg-[#f8f1e7]
            p-4
            rounded-lg
            shadow-md
            flex
            justify-between
            items-center
          "
        >

          <h2 className="text-3xl font-bold">
            Menu Management
          </h2>

          <span className="text-2xl font-bold">
            {isMenuExpanded
              ? '▲'
              : '▼'}
          </span>

        </div>

        {isMenuExpanded && (

          <div>

            <div className="mt-4">

              <button
                onClick={() =>
                  setShowAddItemForm(
                    !showAddItemForm
                  )
                }
                className="
                  bg-blue-500
                  text-white
                  px-4
                  py-2
                  rounded-md
                  hover:bg-blue-600
                  transition-colors
                "
              >
                {showAddItemForm
                  ? 'Cancel'
                  : 'Add New Item'}
              </button>

              {showAddItemForm && (

                <form
                  onSubmit={
                    handleAddMenuItem
                  }
                  className="
                    mt-4
                    p-4
                    bg-white
                    rounded-lg
                    shadow-md
                  "
                >

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-4
                    "
                  >

                    <input
                      type="text"
                      value={
                        newItemName
                      }
                      onChange={e =>
                        setNewItemName(
                          e.target.value
                        )
                      }
                      placeholder="Item Name"
                      className="
                        p-2
                        border
                        rounded-md
                      "
                      required
                    />

                    <input
                      type="number"
                      value={
                        newItemPrice
                      }
                      onChange={e =>
                        setNewItemPrice(
                          e.target.value
                        )
                      }
                      placeholder="Price"
                      className="
                        p-2
                        border
                        rounded-md
                      "
                      required
                      step="0.01"
                    />

                    <input
                      type="text"
                      value={
                        newItemCategory
                      }
                      onChange={e =>
                        setNewItemCategory(
                          e.target.value
                        )
                      }
                      placeholder="Category"
                      className="
                        p-2
                        border
                        rounded-md
                      "
                      required
                    />

                    <input
                      type="file"
                      onChange={
                        handleImageChange
                      }
                      className="
                        p-2
                        border
                        rounded-md
                      "
                      disabled={
                        uploading
                      }
                    />

                  </div>

                  <button
                    type="submit"
                    className="
                      mt-4
                      w-full
                      bg-green-500
                      text-white
                      px-4
                      py-2
                      rounded-md
                      hover:bg-green-600
                      transition-colors
                    "
                    disabled={
                      uploading ||
                      isSubmitting
                    }
                  >
                    {uploading
                      ? 'Uploading...'
                      : isSubmitting
                        ? 'Adding...'
                        : 'Add Item'}
                  </button>

                </form>

              )}

            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-6
                mt-4
              "
            >

              {menu.map(item => (

                <div
                  key={item.id}
                  className="
                    bg-[#f8f1e7]
                    p-4
                    rounded-lg
                    shadow-md
                  "
                >

                  {editingItem &&
                  editingItem.id ===
                    item.id ? (

                    <form
                      onSubmit={
                        handleUpdateMenuItem
                      }
                    >

                      <img
                        src={
                          editingItem.image ||
                          '/placeholder.png'
                        }
                        alt={
                          editingItem.name
                        }
                        className="
                          w-full
                          h-32
                          object-cover
                          mb-4
                          rounded-md
                        "
                      />

                      <input
                        type="text"
                        value={
                          editingItem.name
                        }
                        onChange={e =>
                          setEditingItem(
                            prev => ({
                              ...prev,
                              name:
                                e.target.value
                            })
                          )
                        }
                        placeholder="Item Name"
                        className="
                          w-full
                          p-2
                          border
                          rounded-md
                          mb-2
                        "
                        required
                      />

                      <input
                        type="number"
                        value={
                          editingItem.price
                        }
                        onChange={e =>
                          setEditingItem(
                            prev => ({
                              ...prev,
                              price:
                                e.target.value
                            })
                          )
                        }
                        placeholder="Price"
                        className="
                          w-full
                          p-2
                          border
                          rounded-md
                          mb-2
                        "
                        required
                        step="0.01"
                      />

                      <input
                        type="text"
                        value={
                          editingItem.category
                        }
                        onChange={e =>
                          setEditingItem(
                            prev => ({
                              ...prev,
                              category:
                                e.target.value
                            })
                          )
                        }
                        placeholder="Category"
                        className="
                          w-full
                          p-2
                          border
                          rounded-md
                          mb-2
                        "
                        required
                      />

                      <input
                        type="file"
                        onChange={
                          handleImageChange
                        }
                        className="
                          w-full
                          p-2
                          border
                          rounded-md
                          mb-4
                        "
                        disabled={
                          uploading
                        }
                      />

                      <div
                        className="
                          flex
                          justify-end
                          gap-2
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem(
                              null
                            )
                          }
                          className="
                            bg-gray-500
                            text-white
                            px-4
                            py-2
                            rounded-md
                            hover:bg-gray-600
                          "
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="
                            bg-green-500
                            text-white
                            px-4
                            py-2
                            rounded-md
                            hover:bg-green-600
                          "
                          disabled={
                            uploading ||
                            isSubmitting
                          }
                        >
                          {uploading
                            ? 'Uploading...'
                            : isSubmitting
                              ? 'Saving...'
                              : 'Save'}
                        </button>

                      </div>

                    </form>

                  ) : (

                    <div>

                      {item.image && (

                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="
                            w-full
                            h-32
                            object-cover
                            mb-4
                            rounded-md
                          "
                        />

                      )}

                      <h3 className="text-lg font-bold">
                        {item.name}
                      </h3>

                      <p>
                        ₹
                        {Number(
                          item.price || 0
                        ).toFixed(2)}
                      </p>

                      <p className="text-sm text-gray-600">
                        {item.category}
                      </p>

                      <div
                        className="
                          flex
                          justify-end
                          gap-2
                          mt-4
                        "
                      >

                        <button
                          onClick={() =>
                            setEditingItem(
                              item
                            )
                          }
                          className="
                            w-full
                            bg-yellow-500
                            text-white
                            px-4
                            py-2
                            rounded-md
                            hover:bg-yellow-600
                            transition-colors
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteMenuItem(
                              item.id
                            )
                          }
                          className="
                            w-full
                            bg-red-500
                            text-white
                            px-4
                            py-2
                            rounded-md
                            hover:bg-red-600
                            transition-colors
                          "
                          disabled={
                            isDeleting[
                              item.id
                            ]
                          }
                        >
                          {isDeleting[
                            item.id
                          ]
                            ? 'Deleting...'
                            : 'Delete'}
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
