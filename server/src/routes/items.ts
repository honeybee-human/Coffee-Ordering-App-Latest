import { Router } from 'express';
import { ItemModel } from '../models';

export const itemsRouter = Router();

itemsRouter.get('/', async (req, res) => {
  const { type } = req.query as { type?: 'coffee' | 'pastry' };
  console.log('[items] GET /api/items start', { type });
  try {
    const filter = type ? { type } : {};
    const items = await ItemModel.find(filter).lean();
    console.log('[items] GET /api/items success', { count: items.length, type });
    res.json(items);
  } catch (err) {
    console.error('[items] GET /api/items error', { type, error: String(err) });
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});