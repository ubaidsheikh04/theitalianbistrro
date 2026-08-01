import { Router } from 'express';
import { db } from './database.js';

const router = Router();

router.get('/', (req, res) => {
  res.send('<h1>Homepage</h1>');
});

// Get all menu items
router.get('/menu', async (req, res) => {
  const menu = await db.collection('menu').get();
  const menuItems = menu.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(menuItems);
});

// Create a new order
router.post('/orders', async (req, res) => {
  const { tableId, items } = req.body;
  const newOrder = await db.collection('orders').add({ tableId, items, status: 'accepted' });
  res.json({ id: newOrder.id });
});

// Get all orders
router.get('/orders', async (req, res) => {
  const orders = await db.collection('orders').get();
  const allOrders = orders.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(allOrders);
});

// Update order status
router.put('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await db.collection('orders').doc(id).update({ status });
  res.json({ success: true });
});

export default router;