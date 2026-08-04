export let menu = [
  { id: 1, name: "Coffee", price: 3.5, available: true },
  { id: 2, name: "Tea", price: 2.5, available: true },
  { id: 3, name: "Sandwich", price: 7.0, available: true },
  { id: 4, name: "Cake", price: 5.0, available: false },
];

export let tables = [
  { id: 1, number: 1, occupied: false, orderIds: [], totalBill: 0 },
  { id: 2, number: 2, occupied: true, orderIds: [1], totalBill: 10.5 },
  { id: 3, number: 3, occupied: false, orderIds: [], totalBill: 0 },
  { id: 4, number: 4, occupied: true, orderIds: [2], totalBill: 2.5 },
  { id: 5, number: 5, occupied: false, orderIds: [], totalBill: 0 },
  { id: 6, number: 6, occupied: false, orderIds: [], totalBill: 0 },
  { id: 7, number: 7, occupied: false, orderIds: [], totalBill: 0 },
  { id: 8, number: 8, occupied: false, orderIds: [], totalBill: 0 },
  { id: 9, number: 9, occupied: false, orderIds: [], totalBill: 0 },
  { id: 10, number: 10, occupied: false, orderIds: [], totalBill: 0 },
];

export let orders = [
  {
    id: 1,
    tableId: 2,
    items: [
      { id: 1, name: "Coffee", price: 3.5 },
      { id: 3, name: "Sandwich", price: 7.0 },
    ],
    status: "preparing",
  },
  {
    id: 2,
    tableId: 4,
    items: [{ id: 2, name: "Tea", price: 2.5 }],
    status: "accepted",
  },
];
