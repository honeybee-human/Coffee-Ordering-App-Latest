import { Router } from 'express';
import { ItemModel } from '../models';

export const menuRouter = Router();

// GET /api/menu - return coffee and pastry sections
menuRouter.get('/', async (req, res) => {
  console.log('[menu] GET /api/menu start');
  try {
    const [coffee, pastry] = await Promise.all([
      ItemModel.find({ type: 'coffee' }).lean(),
      ItemModel.find({ type: 'pastry' }).lean(),
    ]);
    console.log('[menu] GET /api/menu success', { coffee: coffee.length, pastry: pastry.length });
    res.json({ coffee, pastry });
  } catch (err) {
    console.error('[menu] GET /api/menu error', { error: String(err) });
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});