import { Router } from 'express';
import { GroupModel } from '../models';

export const groupsRouter = Router();

groupsRouter.get('/', async (req, res) => {
  const groups = await GroupModel.find().lean();
  res.json(groups);
});

groupsRouter.post('/', async (req, res) => {
  try {
    const group = await GroupModel.create({ name: req.body.name });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create group', details: String(err) });
  }
});