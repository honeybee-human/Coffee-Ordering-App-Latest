import { Router } from 'express';
import { ItemModel } from '../models';

export const itemsRouter = Router();

itemsRouter.get('/', async (req, res) => {
  const items = await ItemModel.find().lean();
  res.json(items);
});