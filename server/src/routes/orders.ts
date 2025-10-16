import { Router } from 'express';
import { OrderModel } from '../models';

export const ordersRouter = Router();

ordersRouter.get('/', async (req, res) => {
  console.log('[orders] GET /api/orders start');
  try {
    const orders = await OrderModel.find().lean();
    console.log('[orders] GET /api/orders success', { count: orders.length });
    res.json(orders);
  } catch (err) {
    console.error('[orders] GET /api/orders error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

ordersRouter.post('/', async (req, res) => {
  console.log('[orders] POST /api/orders start', { bodyKeys: Object.keys(req.body || {}) });
  try {
    const order = await OrderModel.create(req.body);
    console.log('[orders] POST /api/orders success', { id: order._id });
    res.status(201).json(order);
  } catch (err) {
    console.error('[orders] POST /api/orders error', { error: String(err) });
    res.status(400).json({ error: 'Failed to create order', details: String(err) });
  }
});