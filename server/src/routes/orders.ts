import { Router } from 'express';
import { OrderModel } from '../models';

export const ordersRouter = Router();

ordersRouter.get('/', async (req, res) => {
  const orders = await OrderModel.find().lean();
  res.json(orders);
});

ordersRouter.post('/', async (req, res) => {
  try {
    const order = await OrderModel.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create order', details: String(err) });
  }
});